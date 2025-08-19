const Address = require("../../model/Address");

const addAddress = async (req, res) => {
  const { userId, name, email, address, city, distric, phone, notes } =
    req.body;
  try {
    if (!userId || !address || !city || !distric || !phone || !name || !email) {
      return res.status(404).json({
        success: false,
        message: "File the require address",
      });
    }
    const newlyAddress = new Address({
      userId,
      name,
      email,
      address,
      city,
      distric,
      phone,
      notes,
    });

    await newlyAddress.save();
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newlyAddress,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const updateAddress = async (req, res) => {
  const fromData = req.body;
  const { userId, addressId } = req.params;
  if (!userId || !addressId) {
    return res.status(404).json({
      success: false,
      message: "Address not found!",
    });
  }
  try {
    const address = await Address.findOneAndUpdate(
      {
        _id: addressId,
        userId,
      },
      fromData,
      { new: true }
    );
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({
      success: true,
      data: address,
      message: "Address updated",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const fetchAddress = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found!",
      });
    }

    const addressList = await Address.find({ userId });
    if (!addressList) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

const deleteAddress = async (req, res) => {
  const { userId, addressId } = req.params;
  try {
    if (!userId || !addressId) {
      return res.status(404).json({
        success: false,
        message: "File the require address",
      });
    }
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Address delete successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

module.exports = { addAddress, updateAddress, fetchAddress, deleteAddress };
