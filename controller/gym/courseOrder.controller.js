const crypto = require("crypto");
const SSLCommerzPayment = require("sslcommerz-lts");
const courseOrder = require("../../model/courseOrder.js");
const store_id = process.env.REACT_APP_STORE_ID;
const store_passwd = process.env.REACT_APP_STORE_PASSWD;
const is_live = false;

console.log(store_id, store_passwd, is_live);

const createCourseOrder = async (req, res) => {
  const id = crypto.randomBytes(16).toString("hex");
  const {
    userId,
    course,
    addressInfo,
    orderStatus,
    paymentMethod,
    paymentStatus,
    totalAmount,
    orderDate,
    orderUpdateDate,
    paymentId,
  } = req.body;

  const data = {
    total_amount: totalAmount,
    currency: "BDT",
    tran_id: id, // use unique tran_id for each api call
    success_url: `https://gym-backend-zeta.vercel.app/api/gym/course/order/payment/success/${id}`,
    fail_url: `https://gym-backend-zeta.vercel.app/api/gym/course/order/payment/fail/${id}`,
    cancel_url: `https://gym-backend-zeta.vercel.app/api/gym/course/order/payment/cancel/${id}`,
    ipn_url: `https://gym-backend-zeta.vercel.app/api/gym/course/order/payment/ipn`,
    shipping_method: "Courier",
    product_name: course?.title,
    product_category: "Electronic",
    product_profile: "gym course",
    cus_name: addressInfo?.name,
    cus_email: addressInfo?.email,
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: addressInfo?.name,
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  sslcz.init(data).then(async (apiResponse) => {
    // Redirect the user to payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL;
    const newOrder = new courseOrder({
      userId,
      course,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: data.tran_id,
    });
    await newOrder.save();
    data.tran_id = "";
    res.status(201).json({
      success: true,
      url: GatewayPageURL,
      orderId: newOrder?._id,
    });
  });
};

const coursePaymentSuccess = async (req, res) => {
  try {
    const result = await courseOrder.updateOne(
      {
        paymentId: req?.params?.trnID,
      },
      {
        $set: {
          paymentStatus: "Paid",
          orderStatus: "Confirmed",
        },
      }
    );
    console.log(result, "result for success course");

    if (result.modifiedCount > 0) {
      return res.redirect(
        `https://gym-frontend-zeta.vercel.app/gym/account?status=success&trnID=${req?.params?.trnID}`
      );
    } else {
      return res.redirect(
        `https://gym-frontend-zeta.vercel.app/gym/account?status=error`
      );
    }
  } catch (error) {
    console.error("Payment success error:", error.message);
    return res.redirect(
      `https://gym-frontend-zeta.vercel.app/gym/account?status=error`
    );
  }
};
const coursePaymentFail = async (req, res) => {
  try {
    const result = await courseOrder.updateOne(
      {
        paymentId: req?.params?.trnID,
      },
      {
        $set: {
          paymentStatus: "Payment Failed",
        },
      }
    );

    if (result.modifiedCount > 0) {
      return res.redirect(
        `https://gym-frontend-zeta.vercel.app/gym/account?status=failed&trnID=${req?.params?.trnID}`
      );
    } else {
      return res.redirect(
        `https://gym-frontend-zeta.vercel.app/gym/account?status=error`
      );
    }
  } catch (error) {
    console.error("Payment fail error:", error.message);
    return res.redirect(
      `https://gym-frontend-zeta.vercel.app/gym/account?status=error`
    );
  }
};

const courseCapturePayment = async (req, res) => {
  const { orderId } = req.body;
  let order = await courseOrder.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Oder not found",
    });
  }
  order.orderStatus = "Confirmed";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order confirmed",
  });
};

const getAllCourseOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await courseOrder.find({ userId });
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }
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

const getCourseOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await courseOrder.findById(id);
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

module.exports = {
  getCourseOrderDetails,
  getAllCourseOrderByUser,
  courseCapturePayment,
  coursePaymentFail,
  coursePaymentSuccess,
  createCourseOrder,
};
