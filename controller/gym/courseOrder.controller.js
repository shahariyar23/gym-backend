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
    const trnID = req?.params?.trnID;
    console.log("Processing course payment success for trnID:", trnID);

    const result = await courseOrder.updateOne(
      {
        paymentId: trnID,
      },
      {
        $set: {
          paymentStatus: "Paid",
          orderStatus: "Confirmed",
        },
      }
    );
    
    console.log("Course order update result:", { modifiedCount: result.modifiedCount, trnID });

    if (result.modifiedCount > 0) {
      console.log("Course payment status updated successfully");
      // Send HTML page that will redirect with query params
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Processing</title>
          <script>
            window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=success&trnID=${trnID}';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
        </html>
      `);
    } else {
      console.warn("Course order was not modified - may already be processed");
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Processed</title>
          <script>
            window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=success&trnID=${trnID}';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Course payment success error:", {
      message: error.message,
      stack: error.stack,
      trnID: req?.params?.trnID,
    });
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <script>
          window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=error&message=Processing failed';
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
      </html>
    `);
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
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Failed</title>
          <script>
            window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=failed&trnID=${req?.params?.trnID}';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
        </html>
      `);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Error</title>
          <script>
            window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=error';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Payment fail error:", error.message);
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <script>
          window.location.href = 'https://gym-frontend-zeta.vercel.app/gym/account?status=error';
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
      </html>
    `);
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
