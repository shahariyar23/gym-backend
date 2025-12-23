// Enhanced error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Server error:', err);
  
  if (err.name === 'MongoServerSelectionError' || 
      err.message.includes('buffering timed out') ||
      err.message.includes('connection timed out')) {
    return res.status(503).json({
      error: "Database timeout",
      message: "Please try again in a few moments"
    });
  }
  
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}

module.exports = errorHandler;
