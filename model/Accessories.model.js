const mongoose = require("mongoose");

const accessoriesSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      default: 0,
      set: (v) => (v == null ? 0 : v),
    },
    totalStock: {
      type: Number,
      default: 0,
      set: (v) => (v == null ? 0 : v),
    },
    averageReview: {
      type: Number,
      default: 0,
      set: (v) => (v == null ? 0 : v),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accessories", accessoriesSchema);
