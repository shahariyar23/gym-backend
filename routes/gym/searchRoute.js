const express = require("express");

const searchProduct = require("../../controller/gym/search.controller");

const router = express.Router();

router.get("/:keyword", searchProduct);

module.exports = router;
