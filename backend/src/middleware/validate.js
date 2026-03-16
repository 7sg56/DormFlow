const { ZodError } = require('zod');

/**
 * Zod validation middleware factory
 * Usage: validate({ body: schema, params: schema, query: schema })
 */
function validate(schemas) {
  return (req, res, next) => {
    const errors = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
            location: 'body',
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
            location: 'params',
          }))
        );
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
            location: 'query',
          }))
        );
      } else {
        req.query = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

module.exports = { validate };
