const express = require("express");
const UserController = require("../controller/UserController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const routes = express();

routes.get("/all", isAuthenticated, isAdmin, UserController.getAll);

// we can't provide userId in the route here, because used userId for user Identification
routes.patch(
  "/update/:customerId",
  isAuthenticated,
  isAdmin,
  UserController.update
);

routes.delete(
  "/delete/:customerId",
  isAuthenticated,
  isAdmin,
  UserController.delete
);

module.exports = routes;
