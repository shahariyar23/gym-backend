const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "mostakshahariyar",
  api_key: "548443337817757",
  api_secret: "HSIW6TuOs2Ci3yIjt7jsBdNmDp8",
});

// Use multer memory storage to store files in memory as buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const imageUploaderUtils = async (file) => {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
};

// Export functions using module.exports
module.exports = { imageUploaderUtils, upload };
