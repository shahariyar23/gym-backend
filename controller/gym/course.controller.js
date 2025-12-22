const Course = require("../../model/course.model.js");

const fetchFilterCourse = async (req, res) => {
  const { Category = [], Type = [], sortBy } = req.query;
  try {
    let filter = {};
    if (Category.length) {
      filter.category = { $in: Category.split(",") };
    }
    if (Type.length) {
      filter.gymType = { $in: Type.split(",") };
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

    const courses = await Course.find(filter).sort(sort).limit(100);
    res.status(200).json({
      success: true,
      courses,
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
    const courses = await Course.find().sort({ updatedAt: -1 }).limit(5);
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "error happend",
    });
  }
};

const getCoureseDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Not found course",
      });
    }
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "error happend",
    });
  }
};

module.exports = {
  fetchFilterCourse,
  getCoureseDetails,
  fetchHomePage,
};
