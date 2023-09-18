const express = require("express");
const routes = express();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const DiscountController = require("../controller/DiscountController");

routes.post(
  "/create",
  isAuthenticated,
  isAdmin,
  DiscountController.createDiscount
);

module.exports = routes;
