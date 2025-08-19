const Order = require("../../model/courseOrder.js");

const getAllOrderByAllUsers = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({
      success: true,
      data: orders,
      message: "Order successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: true,
        message: "Order is not found",
      });
    }
    res.status(201).json({
      success: true,
      message: "Order deltail get successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    await Order.findByIdAndUpdate(id, { orderStatus });
    res.status(201).json({
      success: true,
      message: "Order status Updated",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

module.exports = {
  getAllOrderByAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
