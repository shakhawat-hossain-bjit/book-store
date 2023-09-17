const express = require("express");
const UserController = require("../controller/UserController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const routes = express();

routes.get("/all", isAuthenticated, isAdmin, UserController.getAll);
routes.delete(
  "/delete/:customerId",
  isAuthenticated,
  isAdmin,
  UserController.delete
);

module.exports = routes;
