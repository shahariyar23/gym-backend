const express = require("express");
const {
  getReview,
  addReview,
} = require("../../controller/gym/review.controller");

const router = express.Router();

router.get("/review/:productId", getReview);
router.post("/add", addReview);

module.exports = router;
