const express = require("express");
const {
  getAllOrderByAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controller/admin/order.controller.js");

const router = express.Router();

router.get("/list", getAllOrderByAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.post("/orderStatus/:id", updateOrderStatus);

module.exports = router;
