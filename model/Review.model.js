const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    productId: String,
    userId: String,
    userName: String,
    reviewMessage: {
      type: String,
      set: (v) =>  (v==null ? "No Review": v)    
    },
    reviewValue: Number,
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
