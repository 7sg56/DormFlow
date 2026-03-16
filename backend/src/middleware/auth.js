const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../lib/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dormflow_jwt_secret_change_me';

/**
 * JWT authentication middleware
 * Extracts user from Bearer token and attaches to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
}

/**
 * Role-based access control middleware
 * Usage: authorize('admin', 'warden')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization denied', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}

module.exports = { authenticate, authorize, optionalAuth, JWT_SECRET };
