const express = require("express");
const routes = express();
const ReviewController = require("../controller/ReviewController");
const { reviewValidator } = require("../middleware/validation");
const {
  isAuthenticated,
  checkUserIdWithBodyId,
} = require("../middleware/auth");

routes.post(
  "/create",
  //   isAuthenticated,
  //   checkUserIdWithBodyId,
  reviewValidator.addReview,
  ReviewController.create
);

routes.patch(
  "/update/:reviewId",
  isAuthenticated,
  //   checkUserIdWithBodyId,
  reviewValidator.updateReview,
  ReviewController.update
);

routes.delete(
  "/delete/:reviewId",
  isAuthenticated,
  //   checkUserIdWithBodyId,
  //   reviewValidator.updateReview,
  ReviewController.delete
);

module.exports = routes;
