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
 * Generic CRUD router factory
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
  } = options;

  const router = Router();
  const prismaModel = prisma[model];

  if (!prismaModel) {
    throw new Error(`Prisma model "${model}" not found`);
  }

  // GET / — List with pagination
  router.get(
    '/',
    cacheMiddleware(cachePrefix, cacheTtl),
    validate({ query: paginationQuery }),
    async (req, res, next) => {
      try {
        const { page, limit, sort, order } = req.query;
        const skip = (page - 1) * limit;

        const orderBy = sort ? { [sort]: order } : { created_at: 'desc' };

        const [data, total] = await Promise.all([
          prismaModel.findMany({
            skip,
            take: limit,
            orderBy,
            include: includes,
          }),
          prismaModel.count(),
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
    }
  );

  // GET /:id — Get single record
  router.get(
    '/:id',
    cacheMiddleware(cachePrefix, cacheTtl),
    validate({ params: idParam }),
    async (req, res, next) => {
      try {
        const record = await prismaModel.findUnique({
          where: { [idField]: req.params.id },
          include: includes,
        });

        if (!record) {
          throw new AppError(404, `${model} not found`);
        }

        res.json({ success: true, data: record });
      } catch (err) {
        next(err);
      }
    }
  );

  // POST / — Create
  router.post(
    '/',
    writeLimiter,
    idempotency,
    validate({ body: createSchema }),
    async (req, res, next) => {
      try {
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
    }
  );

  // PUT /:id — Update
  router.put(
    '/:id',
    writeLimiter,
    validate({ params: idParam, body: updateSchema }),
    async (req, res, next) => {
      try {
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
    }
  );

  // DELETE /:id — Delete
  router.delete(
    '/:id',
    writeLimiter,
    validate({ params: idParam }),
    async (req, res, next) => {
      try {
        await prismaModel.delete({
          where: { [idField]: req.params.id },
        });

        await invalidateCache(cachePrefix);

        logger.info(`Deleted ${model}`, { id: req.params.id });

        res.json({ success: true, message: `${model} deleted` });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}

module.exports = { createCrudRouter };
