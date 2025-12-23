require("dotenv").config();
const { connectDB } = require("./config/database.js");

async function test() {
  console.log("Testing MongoDB Connection...");
  console.log("MongoDB URI:", process.env.REACT_APP_MONGODB_URI ? "✅ Found" : "❌ Not found");
  
  try {
    await connectDB();
    console.log("✅ Database connection test PASSED");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection test FAILED");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

test();
