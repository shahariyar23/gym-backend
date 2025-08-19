const { imageUploaderUtils } = require("../../helper/cloudinary");
const cloudinary = require("cloudinary").v2;
const Accessories = require("../../model/Accessories.model.js");

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

// add accessories
const createAccessories = async (req, res) => {
  const {
    image,
    title,
    description,
    category,
    type,
    price,
    offerPrice,
    brand,
    totalStock,
  } = req.body;
  // console.log(req.body);

  try {
    const newAccessories = new Accessories({
      image,
      title,
      description,
      category,
      type,
      price,
      offerPrice,
      brand,
      totalStock,
    });
    // console.log(newAccessories);

    await newAccessories.save();
    res.status(201).json({
      success: true,
      message: "Accessories create successfully!!",
      newAccessories,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};

// fetch all Accessories
const getAllAccessories = async (req, res) => {
  try {
    const listOfAccessories = await Accessories.find({});
    res.status(200).json({
      success: true,
      listOfAccessories,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};
// edit or update Accessories
const updateAccessories = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    type,
    price,
    offerPrice,
    brand,
    totalStock,
  } = req.body;

  try {
    const findAccessories = await Accessories.findById(id);
    if (!findAccessories) {
      return res.status(404).json({
        success: false,
        message: "Accessories not found",
      });
    }
    findAccessories.title = title || findAccessories.title;
    findAccessories.description = description || findAccessories.description;
    findAccessories.category = category || findAccessories.category;
    findAccessories.type = type || findAccessories.type;
    findAccessories.price = price || findAccessories.price;
    findAccessories.offerPrice = offerPrice || findAccessories.offerPrice;
    findAccessories.brand = brand || findAccessories.brand;
    findAccessories.totalStock = totalStock || findAccessories.totalStock;
    await findAccessories.save();

    res.status(200).json({
      succes: true,
      message: "Accessories update successfully!!!",
      findAccessories,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error?.message || "Error found",
    });
  }
};

// delete Accessories
const deleteAccessories = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteAccessoriesImage = await Accessories.findById(id);
    if (!deleteAccessoriesImage) {
      return res.status(404).json({
        success: false,
        message: "Accessories not found",
      });
    }
    const imageURL = deleteAccessoriesImage.image;
    const imageSplit = imageURL.split("/");
    const lastImageSplit = imageSplit[imageSplit.length - 1].split(".");
    const image = lastImageSplit[0];
    // console.log(image);
    await Accessories.findByIdAndDelete(id);
    await cloudinary.uploader.destroy(image, (error, result) => {
      console.log("Error:", error, "Result: ", result);
    });

    res.status(200).json({
      succes: true,
      message: "Deleted Accessories successfully!!",
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
  createAccessories,
  updateAccessories,
  getAllAccessories,
  deleteAccessories,
};
