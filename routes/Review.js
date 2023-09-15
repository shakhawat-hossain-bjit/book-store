const express = require("express");
const routes = express();
const ReviewController = require("../controller/ReviewController");
const { reviewValidator } = require("../middleware/validation");

routes.post("/create", reviewValidator.addReview, ReviewController.create);

module.exports = routes;
