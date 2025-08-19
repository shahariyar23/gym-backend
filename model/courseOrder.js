const mongoose = require("mongoose");

const courseOrderSchema = new mongoose.Schema({
  userId: String,
  course: {
    productId: String,
    title: String,
    image: String,
    price: String,
  },
  addressInfo: {
    name: String,
    email: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
});

module.exports = mongoose.model("courserOrder", courseOrderSchema);
