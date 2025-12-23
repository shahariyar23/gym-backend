const mongoose = require("mongoose");

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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      autoReconnect: false,
      heartbeatFrequencyMS: 3000,
      bufferCommands: false,
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

module.exports = { connectDB, getCachedConnection: () => cachedConnection };
