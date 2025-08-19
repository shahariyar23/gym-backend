const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course", // optional, specify the folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage: storage }).single("course");
module.exports = parser;
