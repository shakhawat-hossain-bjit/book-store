const express = require("express");
const routes = express();
const { isAuthenticated } = require("../middleware/auth");
const WalletController = require("../controller/WalletController");

routes.patch(
  "/add-balance",
  isAuthenticated,
  WalletController.addBalanceToWallet
);

module.exports = routes;
