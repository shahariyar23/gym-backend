const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    userId: String,
    address: String,
    city: String,
    distric: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
