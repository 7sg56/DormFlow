const { Router } = require('express');
const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const { validate } = require('../middleware/validate');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');
const { idempotency } = require('../middleware/idempotency');
const { writeLimiter } = require('../middleware/rateLimiter');
const { AppError } = require('../middleware/errorHandler');
const { paginationQuery, idParam } = require('../schemas/common.schema');

/**
 * Role-based access control middleware
 * Creates an authorize middleware for specific roles per operation
 */
function createRoleAuthorize(options) {
  const { get, post, put, delete: del } = options;

  return {
    forGet: get ? authorize(...get) : undefined,
    forPost: post ? authorize(...post) : undefined,
    forPut: put ? authorize(...put) : undefined,
    forDelete: del ? authorize(...del) : undefined,
  };
}

/**
 * Generic CRUD router factory with RBAC support
 * Creates standard REST endpoints for any Prisma model
 *
 * @param {object} options
 * @param {string} options.model - Prisma model name
 * @param {string} options.idField - Primary key field name
 * @param {string} options.cachePrefix - Cache key prefix
 * @param {object} options.createSchema - Zod schema for create
 * @param {object} options.updateSchema - Zod schema for update
 * @param {object} [options.includes] - Prisma include for relations
 * @param {number} [options.cacheTtl] - Cache TTL in seconds
 * @param {object} options.allowedRoles - Roles allowed per operation
 * @param {array} options.allowedRoles.get - Roles allowed for GET operations
 * @param {array} options.allowedRoles.post - Roles allowed for POST operations
 * @param {array} options.allowedRoles.put - Roles allowed for PUT operations
 * @param {array} options.allowedRoles.delete - Roles allowed for DELETE operations
 * @param {function} options.filterByUser - Function to filter data by user context
 * @param {boolean} options.authenticateAll - If true, apply authenticate to all routes (default: true)
 */
function createCrudRouter(options) {
  const {
    model,
    idField,
    cachePrefix,
    createSchema,
    updateSchema,
    includes = {},
    cacheTtl = 300,
    allowedRoles = {},
    filterByUser = null,
    authenticateAll = true,
  } = options;

  const router = Router();
  const prismaModel = prisma[model];

  if (!prismaModel) {
    throw new Error(`Prisma model "${model}" not found`);
  }

  // Create RBAC middleware
  const { forGet, forPost, forPut, forDelete } = createRoleAuthorize(allowedRoles);

  /**
   * Apply user context filter to query
   */
  async function applyUserFilter(req, query) {
    if (!filterByUser || !req.user) return query;

    try {
      const filter = await filterByUser(req);
      if (filter && Object.keys(filter).length > 0) {
        return { ...query, ...filter };
      }
    } catch (err) {
      logger.warn('Filter by user failed', { error: err.message });
    }
    return query;
  }

  // GET / — List with pagination
  const getRoute = async (req, res, next) => {
    try {
      const { page, limit, sort, order } = req.query;
      const skip = (page - 1) * limit;

      const orderBy = sort ? { [sort]: order } : { created_at: 'desc' };

      let where = {};
      where = await applyUserFilter(req, where);

      const [data, total] = await Promise.all([
        prismaModel.findMany({
          skip,
          take: limit,
          orderBy,
          include: includes,
          where,
        }),
        prismaModel.count({ where }),
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  const getRouteMiddleware = [];
  if (authenticateAll) getRouteMiddleware.push(require('../middleware/auth').authenticate);
  if (forGet) getRouteMiddleware.push(forGet);
  getRouteMiddleware.push(cacheMiddleware(cachePrefix, cacheTtl));
  getRouteMiddleware.push(validate({ query: paginationQuery }));
  router.get('/', ...getRouteMiddleware, getRoute);

  // GET /:id — Get single record
  const getByIdRoute = async (req, res, next) => {
    try {
      let where = { [idField]: req.params.id };
      where = await applyUserFilter(req, where);

      const record = await prismaModel.findFirst({
        where,
        include: includes,
      });

      if (!record) {
        throw new AppError(404, `${model} not found`);
      }

      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  const getByIdRouteMiddleware = [];
  if (authenticateAll) getByIdRouteMiddleware.push(require('../middleware/auth').authenticate);
  if (forGet) getByIdRouteMiddleware.push(forGet);
  getByIdRouteMiddleware.push(cacheMiddleware(cachePrefix, cacheTtl));
  getByIdRouteMiddleware.push(validate({ params: idParam }));
  router.get('/:id', ...getByIdRouteMiddleware, getByIdRoute);

  // POST / — Create
  const postRoute = async (req, res, next) => {
    try {
      // Check ownership for warden updating their own hostel
      if (filterByUser && req.user && req.user.role === 'warden') {
        const filter = await filterByUser(req);
        if (filter && Object.keys(filter).length > 0) {
          req.body = { ...req.body, ...filter };
        }
      }

      const record = await prismaModel.create({
        data: req.body,
        include: includes,
      });

      await invalidateCache(cachePrefix);

      logger.info(`Created ${model}`, { id: record[idField] });

      res.status(201).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  const postRouteMiddleware = [];
  if (authenticateAll) postRouteMiddleware.push(require('../middleware/auth').authenticate);
  if (forPost) postRouteMiddleware.push(forPost);
  postRouteMiddleware.push(writeLimiter);
  postRouteMiddleware.push(idempotency);
  postRouteMiddleware.push(validate({ body: createSchema }));
  router.post('/', ...postRouteMiddleware, postRoute);

  // PUT /:id — Update
  const putRoute = async (req, res, next) => {
    try {
      let where = { [idField]: req.params.id };
      where = await applyUserFilter(req, where);

      // Check if record exists and user has access
      const existing = await prismaModel.findFirst({ where });
      if (!existing) {
        throw new AppError(404, `${model} not found`);
      }

      // Check ownership for warden updating their own hostel
      if (filterByUser && req.user && req.user.role === 'warden') {
        const filter = await filterByUser(req);
        if (filter && Object.keys(filter).length > 0) {
          req.body = { ...req.body, ...filter };
        }
      }

      const record = await prismaModel.update({
        where: { [idField]: req.params.id },
        data: req.body,
        include: includes,
      });

      await invalidateCache(cachePrefix);

      logger.info(`Updated ${model}`, { id: req.params.id });

      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  const putRouteMiddleware = [];
  if (authenticateAll) putRouteMiddleware.push(require('../middleware/auth').authenticate);
  if (forPut) putRouteMiddleware.push(forPut);
  putRouteMiddleware.push(writeLimiter);
  putRouteMiddleware.push(validate({ params: idParam, body: updateSchema }));
  router.put('/:id', ...putRouteMiddleware, putRoute);

  // DELETE /:id — Delete
  const deleteRoute = async (req, res, next) => {
    try {
      let where = { [idField]: req.params.id };
      where = await applyUserFilter(req, where);

      // Check if record exists and user has access
      const existing = await prismaModel.findFirst({ where });
      if (!existing) {
        throw new AppError(404, `${model} not found`);
      }

      await prismaModel.delete({
        where: { [idField]: req.params.id },
      });

      await invalidateCache(cachePrefix);

      logger.info(`Deleted ${model}`, { id: req.params.id });

      res.json({ success: true, message: `${model} deleted` });
    } catch (err) {
      next(err);
    }
  };

  const deleteRouteMiddleware = [];
  if (authenticateAll) deleteRouteMiddleware.push(require('../middleware/auth').authenticate);
  if (forDelete) deleteRouteMiddleware.push(forDelete);
  deleteRouteMiddleware.push(writeLimiter);
  deleteRouteMiddleware.push(validate({ params: idParam }));
  router.delete('/:id', ...deleteRouteMiddleware, deleteRoute);

  return router;
}

/**
 * Helper function to authorize middleware
 */
function authorize(...roles) {
  return require('../middleware/auth').authorize(...roles);
}

module.exports = { createCrudRouter };
