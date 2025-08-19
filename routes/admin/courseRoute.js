const express = require("express");
const { upload } = require("../../helper/cloudinary.js");
const {
  handelImageUpload,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourse,
} = require("../../controller/admin/course.controller.js");
const parser = require("../../utils/multer.js");

const router = express.Router();

router.post("/upload", upload.single("course"), handelImageUpload);
router.post("/create", createCourse);
router.get("/get", getAllCourse);
router.put("/update/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);

module.exports = router;
