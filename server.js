const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

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

// Connection caching for serverless environments
let cachedConnection = null;

async function connectDB() {
  // If connection is cached and still connected, use it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.REACT_APP_MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    console.log("🔄 Creating new MongoDB connection...");
    
    // Close existing connection if it exists
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Optimized connection settings for serverless
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000, // Reduced from 10000
      socketTimeoutMS: 30000, // Reduced from 60000
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      // Disable auto-reconnect in serverless
      autoReconnect: false,
      // Better heartbeat settings
      heartbeatFrequencyMS: 3000,
      // Don't buffer commands if no connection
      bufferCommands: false,
      // Don't create indexes automatically
      autoIndex: false,
    };

    // Add retry logic
    const maxRetries = 3;
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await mongoose.connect(mongoUri, connectionOptions);
        cachedConnection = mongoose.connection;
        
        // Set up connection event handlers
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err.message);
          cachedConnection = null;
        });
        
        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
          cachedConnection = null;
        });
        
        console.log("✅ MongoDB connected successfully");
        return cachedConnection;
      } catch (error) {
        lastError = error;
        console.log(`⚠️ Connection attempt ${i + 1} failed, retrying...`);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    cachedConnection = null;
    throw error;
  }
}

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

const app = express();
const PORT = process.env.REACT_APP_PORT || 8000;

// CORS Configuration
const allowedOrigins = [
  "https://gym-frontend-zeta.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply DB connection middleware to all routes
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

// Enhanced error handling middleware
app.use((err, req, res, next) => {
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
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  console.log('MongoDB connection closed. Goodbye!');
  process.exit(0);
});

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