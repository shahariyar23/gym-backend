const express = require("express");
const {
  getAllAccessoriesOrderByUser,
  getAccessoriesOrderDetails,
  createAccessoriesOrder,
  accessoriesPaymentSuccess,
  accessoriesPaymentFail,
  accessoriesCapturePayment,
} = require("../../controller/gym/accessoriesOrder.controller.js");

const router = express.Router();

router.get("/list/:userId", getAllAccessoriesOrderByUser);
router.get("/details/:id", getAccessoriesOrderDetails);
router.post("/payment", createAccessoriesOrder);
router.post("/payment/success/:trnID", accessoriesPaymentSuccess);
router.post("/payment/fail/:trnID", accessoriesPaymentFail);
router.post("/captureOrder", accessoriesCapturePayment);

module.exports = router;
