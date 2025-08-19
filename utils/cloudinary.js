const cloudinary = require("cloudinary");
// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: "mostakshahariyar",
  api_key: "548443337817757",
  api_secret: "HSIW6TuOs2Ci3yIjt7jsBdNmDp8",
});

module.exports = cloudinary.v2;
