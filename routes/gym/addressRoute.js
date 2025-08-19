const express = require("express");

const {
  addAddress,
  fetchAddress,
  updateAddress,
  deleteAddress,
} = require("../../controller/gym/address.controller.js");

const route = express.Router();

route.post("/add", addAddress);
route.get("/fetch/:userId", fetchAddress);
route.put("/update/:userId/:addressId", updateAddress);
route.delete("/delete/:userId/:addressId", deleteAddress);

module.exports = route;
