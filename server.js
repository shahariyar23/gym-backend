const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import configuration and middleware
const corsConfig = require("./config/cors.js");
const ensureDBConnection = require("./middleware/dbConnection.js");
const errorHandler = require("./middleware/errorHandler.js");
const setupGracefulShutdown = require("./middleware/gracefulShutdown.js");

// Import routes
const authRoute = require("./routes/auth/authRoute.js");
const adminCourseRoute = require("./routes/admin/courseRoute.js");
const adminAccessoriesRoute = require("./routes/admin/accessoriesRoute.js");
const adminOrderList = require("./routes/admin/orderRoute.js");

const gymCourseRoute = require("./routes/gym/courseRoute.js");
const gymAccessoriesRoute = require("./routes/gym/accessoriesRoute.js");
const gymCartRoute = require("./routes/gym/cartRoute.js");
const gymAddressRoute = require("./routes/gym/addressRoute.js");
const gymAccessoriesOrderRoute = require("./routes/gym/accessoriesOrderRoute.js");
const gymCourseOrderRoute = require("./routes/gym/courseOrder.route.js");
const gymReviewRoute = require("./routes/gym/reviewRoute.js");
const gymSearchRoute = require("./routes/gym/searchRoute.js");

const app = express();
const PORT = process.env.REACT_APP_PORT || 8000;

// Apply middleware
app.use(corsConfig);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ensureDBConnection);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/admin/course", adminCourseRoute);
app.use("/api/admin/accessories", adminAccessoriesRoute);
app.use("/api/admin/order/", adminOrderList);

app.use("/api/gym/course", gymCourseRoute);
app.use("/api/gym/accessories", gymAccessoriesRoute);
app.use("/api/gym/cart", gymCartRoute);
app.use("/api/gym/address", gymAddressRoute);
app.use("/api/gym/accessories/order", gymAccessoriesOrderRoute);
app.use("/api/gym/course/order", gymCourseOrderRoute);
app.use("/api/gym/review", gymReviewRoute);
app.use("/api/search", gymSearchRoute);

// Welcome page
app.get("/", (req, res) => {
  res.status(200).send("<h1>Welcome to Our Gym</h1>");
});

// Health check route (no DB connection required)
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  
  res.status(200).json({ 
    status: "Server is running",
    database: statusMap[dbStatus] || "unknown",
    timestamp: new Date(),
    port: PORT 
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
setupGracefulShutdown();

// Start server
if (process.env.NODE_ENV !== 'production') {
  // Development server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  // For Vercel, export the app as a serverless function
  module.exports = app;
}