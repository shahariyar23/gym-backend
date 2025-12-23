const { connectDB } = require("../config/database.js");

// Routes that don't require DB connection
const skipDBRoutes = ['/health', '/'];

// Middleware to ensure DB connection before handling requests
async function ensureDBConnection(req, res, next) {
  // Skip DB connection for health check and welcome routes
  if (skipDBRoutes.includes(req.path)) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Database connection failed. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = ensureDBConnection;
