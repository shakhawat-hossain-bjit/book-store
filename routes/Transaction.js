const express = require("express");
const routes = express();
const TransactionController = require("../controller/TransactionController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

routes.get("/all", isAuthenticated, isAdmin, TransactionController.getAll);
routes.get(
  "/details/:transactionId",
  isAuthenticated,
  TransactionController.findOne
);
routes.post(
  "/checkout",
  // isAuthenticated,
  TransactionController.create
);

module.exports = routes;
