const express = require("express");
const routes = express();
const { cartValidator } = require("../middleware/validation");
const {
  isAuthenticated,
  isAdmin,
  checkUserIdWithParamsId,
  checkUserIdWithBodyId,
} = require("../middleware/auth");
const CartController = require("../controller/CartController");

routes.get(
  "/:userId",
  // isAuthenticated,
  // checkUserIdWithParamsId,
  CartController.getCart
);

routes.post(
  "/add-book",
  // isAuthenticated,
  // checkUserIdWithBodyId,
  cartValidator.addRemoveItemCart,
  CartController.addBookToCart
);

routes.patch(
  "/remove-book",
  // isAuthenticated,
  cartValidator.addRemoveItemCart,
  CartController.removeBookFromCart
);

module.exports = routes;
