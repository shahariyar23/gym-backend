const express = require("express");
const {
  addToCart,
  updateToCart,
  deleteToCart,
  fetchToCartAccessories,
} = require("../../controller/gym/cart.controller.js");

const route = express.Router();

route.post("/add", addToCart);
route.get("/fetchAccessories/:userId", fetchToCartAccessories);
route.put("/update", updateToCart);
route.delete("/delete/:userId/:accessoriesId", deleteToCart);

module.exports = route;
