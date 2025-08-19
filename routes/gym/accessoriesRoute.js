const express = require("express");
const {
  fetchFilterAccessories,
  getAccessoriesDetails,
  fetchHomePage,
} = require("../../controller/gym/accessories.controller.js");

const route = express.Router();

route.get("/get", fetchFilterAccessories);
route.get("/fetch-home", fetchHomePage);
route.get("/getDetails/:id", getAccessoriesDetails);

module.exports = route;
