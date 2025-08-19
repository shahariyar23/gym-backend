const express = require("express");
const {
  getCourseOrderDetails,
  getAllCourseOrderByUser,
  courseCapturePayment,
  coursePaymentFail,
  coursePaymentSuccess,
  createCourseOrder,
} = require("../../controller/gym/courseOrder.controller.js");

const router = express.Router();

router.get("/list/:userId", getAllCourseOrderByUser);
router.get("/details/:id", getCourseOrderDetails);
router.post("/payment", createCourseOrder);
router.post("/payment/success/:trnID", coursePaymentSuccess);
router.post("/payment/fail/:trnID", coursePaymentFail);
router.post("/captureOrder", courseCapturePayment);

module.exports = router;
