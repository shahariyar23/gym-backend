const mongoose = require("mongoose");

const accessoriesOrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      accessoriesId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    name: String,
    email: String,
    addressId: String,
    address: String,
    city: String,
    distric: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
});

module.exports = mongoose.model("accessoriesOrder", accessoriesOrderSchema);
