const Course = require("../../model/course.model");

const searchProduct = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword && typeof keyword !== "string") {
      return res.status(404).json({
        success: false,
        message: "keyword not found",
      });
    }
    const regEx = new RegExp(keyword, "i");
    const createSearchQuery = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { gymType: regEx },
      ],
    };
    const searchResults = await Course.find(createSearchQuery);
    // console.log(searchResults);
    res.status(200).json({
      success: true,
      message: "result",
      data: searchResults,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error happend",
    });
  }
};

module.exports = searchProduct;
