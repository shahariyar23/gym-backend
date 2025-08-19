const { imageUploaderUtils } = require("../../helper/cloudinary");
const cloudinary = require("cloudinary").v2;
const Course = require("../../model/course.model.js");

// handel Image upload for clodinary
const handelImageUpload = async (req, res) => {
  try {
    // Convert the buffer to a base64 string
    const b64 = Buffer.from(req.file.buffer).toString("base64");

    // Properly format the data URL
    const url = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary using the correctly formatted data URI
    const result = await imageUploaderUtils(url);

    // Send back the result
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Error occurred during upload",
    });
  }
};

// add course
const createCourse = async (req, res) => {
  const { image, title, description, category, gymType, price, offerPrice } =
    req.body;

  try {
    const newCourse = new Course({
      image,
      title,
      description,
      category,
      gymType,
      price,
      offerPrice,
    });

    await newCourse.save();
    res.status(201).json({
      success: true,
      message: "Course create successfully!!",
      newCourse,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};

// fetch all course
const getAllCourse = async (req, res) => {
  try {
    const listOfCourse = await Course.find({});
    res.status(200).json({
      success: true,
      listOfCourse,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};
// edit or update course
const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, gymType, price, offerPrice } = req.body;

  try {
    const findCourse = await Course.findById(id);
    if (!findCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    findCourse.title = title || findCourse.title;
    findCourse.description = description || findCourse.description;
    findCourse.category = category || findCourse.category;
    findCourse.gymType = gymType || findCourse.gymType;
    findCourse.price = price || findCourse.price;
    findCourse.offerPrice = offerPrice || findCourse.offerPrice;
    await findCourse.save();

    res.status(200).json({
      succes: true,
      message: "Course update successfully!!!",
      findCourse,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};

// delete course
const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteCourseImage = await Course.findById(id);
    if (!deleteCourseImage) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    const imageURL = deleteCourseImage.image;
    const imageSplit = imageURL.split("/");
    const lastImageSplit = imageSplit[imageSplit.length - 1].split(".");
    const image = lastImageSplit[0];
    const deleteCourse = await Course.findByIdAndDelete(id);
    await cloudinary.uploader.destroy(image, (error, result) => {
      console.log("Error:", error, "Result: ", result);
    });
    if (!deleteCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    res.status(200).json({
      succes: true,
      message: "Deleted course successfully!!",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};

module.exports = {
  handelImageUpload,
  createCourse,
  updateCourse,
  getAllCourse,
  deleteCourse,
};
