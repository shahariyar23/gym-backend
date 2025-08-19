const Order = require("../../model/courseOrder.js");
const Review = require("../../model/Review.model.js");
const Course = require("../../model/course.model.js");

const addReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;
    
      
    const order = await Order.findOne({
      userId,
      "course.productId": productId,
      orderStatus: "Delevered",
    });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You must buy this course",
      });
    }
    const checkExistingReview = await Review.findOne({ userId, productId });
    if (checkExistingReview) {
      console.log(checkExistingReview, "check");
      return res.status(400).json({
        success: false,
        message: "You did review previously",
        data: "You did review previously",
      });
    }
    const newReview = new Review({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();
    const review = await Review.find({ productId });
    const totalReview = review.length;
    const averageReview =
      review.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      totalReview;

    await Course.findByIdAndUpdate(productId, { averageReview });

    res.status(201).json({
      success: true,
      message: "review write",
      newReview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const getReview = async (req, res) => {
  try {
    const { productId } = req.params;

    const review = await Review.find({ productId });
    if (review.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "review not found" });
    }
    res.status(201).json({
      success: true,
      message: "review get",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

module.exports = { addReview, getReview };
