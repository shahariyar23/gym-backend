const express = require("express");
const {
  register,
  login,
  logout,
  authMiddleware,
} = require("../../controller/auth/auth-controller.js");

const router = express.Router();

router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    user,
  });
});

router.post("/create", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
