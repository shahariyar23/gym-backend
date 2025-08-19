const express = require("express");
const {
  fetchFilterCourse,
  getCoureseDetails,
  fetchHomePage,
} = require("../../controller/gym/course.controller.js");

const route = express.Router();

route.get("/get", fetchFilterCourse);
route.get("/fetch-home", fetchHomePage);
route.get("/get/:id", getCoureseDetails);

module.exports = route;
