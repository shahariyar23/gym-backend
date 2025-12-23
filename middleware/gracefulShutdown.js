const mongoose = require("mongoose");

// Graceful shutdown handler
function setupGracefulShutdown() {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing MongoDB connection...');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log('MongoDB connection closed. Goodbye!');
    process.exit(0);
  });
}

module.exports = setupGracefulShutdown;
