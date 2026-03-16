const { z } = require('zod');

// UUID v4 pattern
const uuid = z.string().uuid();

// Pagination query params
const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Common ID param
const idParam = z.object({
  id: uuid,
});

// Date range filter
const dateRange = z.object({
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

// Status filter
const statusFilter = z.object({
  status: z.string().optional(),
});

module.exports = {
  uuid,
  paginationQuery,
  idParam,
  dateRange,
  statusFilter,
};
