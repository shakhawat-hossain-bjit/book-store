const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const { bookValidator } = require("../middleware/validation");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

routes.get("/all", BookController.getAll);

routes.post(
  "/create",
  isAuthenticated,
  isAdmin,
  bookValidator.add,
  BookController.create
);

routes.patch(
  "/update/:bookId",
  isAuthenticated,
  isAdmin,
  BookController.update
);

routes.delete(
  "/delete/:bookId",
  isAuthenticated,
  isAdmin,
  //   bookValidator.add,
  BookController.delete
);

module.exports = routes;
