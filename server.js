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


// MongoDB Connection with serverless optimization
const mongoUri = process.env.REACT_APP_MONGODB_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  retryWrites: true,
  // Serverless specific settings
  maxIdleTimeMS: 45000,
  waitQueueTimeoutMS: 30000,
})
.then((res) => console.log("✅ MongoDB connected (Serverless optimized)"))
.catch((e) => {
  console.error("❌ MongoDB connection error:", e.message);
  process.exit(1);
});


const app = express();
const PORT = process.env.REACT_APP_PORT || 8000;

app.use(
  cors({
    origin: ["https://gym-frontend-zeta.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

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

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "Server is running",
    timestamp: new Date(),
    port: PORT 
  });
});

app.listen(PORT, () => console.log(`Server is running ${PORT}`));
