const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Handle database errors
  if (err.code) {
    // PostgreSQL error codes
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'Resource already exists'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Invalid reference to related resource'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field is missing'
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
    }
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
