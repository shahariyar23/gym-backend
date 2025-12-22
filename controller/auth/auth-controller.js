const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../model/User.model.js");

// register
const register = async (req, res) => {
  const { userName, email, avater, password } = req.body;
  try {
    // Check if any field is missing (use `||` instead of `&&`)
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkUserName = await User.findOne({ userName });
    if (checkUserName) {
      return res.status(400).json({
        success: false,
        message: "User name already present",
      });
    }
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "You have already account",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      avater,
    });

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password is require",
      });
    }
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }
    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password not match. Please try again with valid passord and email",
      });
    }
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "clint_secret_key",
      { expiresIn: "60m" }
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // Set to true on Vercel (production)
        sameSite: "None", // Use 'None' for cross-site in production, 'Lax' locally
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login Successfully!!!",
        user: {
          id: checkUser._id,
          email: checkUser.email,
          role: checkUser.role,
          userName: checkUser.userName,
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

//add middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User unathorise!!",
    });
  }
  try {
    const decode = jwt.verify(token, "clint_secret_key");
    req.user = decode;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

// logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token").json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};
module.exports = { register, login, authMiddleware, logout };
