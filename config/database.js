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
    console.log("Database Host:", mongoUri.split('@')[1] || 'local');
    
    // Close existing connection if it exists
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Optimized connection settings for serverless & local
    const connectionOptions = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      heartbeatFrequencyMS: 5000,
      bufferCommands: true,
      autoIndex: true,
      family: 4, // Use IPv4
    };

    // Add retry logic with exponential backoff
    const maxRetries = 5;
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`📡 Connection attempt ${i + 1}/${maxRetries}...`);
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

        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
        });
        
        console.log("✅ MongoDB connected successfully");
        return cachedConnection;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${i + 1} failed:`, error.message);
        
        if (i < maxRetries - 1) {
          const delayMs = 2000 * Math.pow(2, i); // Exponential backoff
          console.log(`⏳ Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Error details:", error);
    cachedConnection = null;
    throw error;
  }
}

module.exports = { connectDB, getCachedConnection: () => cachedConnection };
