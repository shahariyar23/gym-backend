const { connectDB } = require("../config/database.js");

// Middleware to ensure DB connection before handling requests
async function ensureDBConnection(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Database connection failed"
    });
  }
}

module.exports = ensureDBConnection;
