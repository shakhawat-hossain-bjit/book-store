const express = require("express");
const routes = express();
const BookController = require("../controller/BookController");
const { bookValidator } = require("../middleware/validation");

routes.get("/all", BookController.getAll);
routes.post("/create", bookValidator.add, BookController.create);

module.exports = routes;
