const Accessories = require("../../model/Accessories.model.js");

const fetchFilterAccessories = async (req, res) => {
  const { Category = [], Type = [], sortBy } = req.query;
  console.log(req.params);
  try {
    let filter = {};
    if (Category.length) {
      filter.category = { $in: Category.split(",") };
    }
    if (Type.length) {
      filter.type = { $in: Type.split(",") };
    }

    let sort = {};
    switch (sortBy) {
      case "nameAsc":
        sort.titel = 1;
        break;
      case "nameDesc":
        sort.titel = -1;
        break;
      case "priceAsc":
        sort.price = 1;
        break;
      case "priceDesc":
        sort.price = -1;
        break;
      case "dateAsc":
        sort.updatedAt = 1;
        break;
      case "dateDesc":
        sort.updatedAt = -1;
        break;

      default:
        sort.titel = 1;
        break;
    }

    const accessories = await Accessories.find(filter).sort(sort);
    console.log(accessories);
    res.status(200).json({
      success: true,
      accessories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "error happend",
    });
  }
};

const fetchHomePage = async (req, res) => {
  try {
    const Accessoriess = await Accessories.find().sort("updatedAt=1").limit(5);
    res.status(200).json({
      success: true,
      data: Accessoriess,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "error happend",
    });
  }
};

const getAccessoriesDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const accessories = await Accessories.findById(id);
    if (!accessories) {
      return res.status(404).json({
        success: false,
        message: "Not found course",
      });
    }
    res.status(200).json({
      success: true,
      accessories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "error happend",
    });
  }
};

module.exports = {
  fetchFilterAccessories,
  getAccessoriesDetails,
  fetchHomePage,
};
