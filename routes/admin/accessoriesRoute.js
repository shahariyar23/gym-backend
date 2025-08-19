const express = require("express");
const { upload } = require("../../helper/cloudinary.js");
const {
  handelImageUpload,
  createAccessories,
  getAllAccessories,
  updateAccessories,
  deleteAccessories,
} = require("../../controller/admin/accessories.controller.js");
const parser = require("../../utils/multer.js");

const router = express.Router();

router.post("/upload", upload.single("accessories"), handelImageUpload);
router.post("/create", createAccessories);
router.get("/get", getAllAccessories);
router.put("/update/:id", updateAccessories);
router.delete("/delete/:id", deleteAccessories);

module.exports = router;
