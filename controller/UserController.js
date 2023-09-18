const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../utils/common");
const UserModel = require("../model/User");
const AuthModel = require("../model/Auth");

class UserController {
  async getAll(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the user",
          validation
        );
      }

      const result = await UserModel.find({}).select(
        "-createdAt -updatedAt -__v"
      );
      if (result?.length) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully loaded users",
          result
        );
      }
      return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No User Found");
    } catch (error) {
      //   console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }

  async delete(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the user",
          validation
        );
      }

      const { customerId } = req.params;

      const user = await UserModel.findOne({ _id: customerId });
      const auth = await AuthModel.findOne({ user: customerId });

      if (!user || !auth) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No User Found");
      }

      const userDelete = await UserModel.deleteOne({ _id: customerId });
      const authDelete = await AuthModel.deleteOne({ user: customerId });

      if (userDelete?.deletedCount && authDelete?.deletedCount) {
        return sendResponse(res, HTTP_STATUS.OK, "Successfully deleted");
      }

      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Something went wrong"
      );
    } catch (error) {
      //   console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }

  async update(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the user",
          validation
        );
      }

      const { userName, phone, address } = req.body;
      const { customerId } = req.params;

      const userFind = await UserModel.findOne({ _id: customerId });
      if (!userFind) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User Not Found");
      }

      const userUpdate = await UserModel.updateOne(
        { _id: customerId },
        { $set: { userName, phone, address } }
      );

      // console.log(userUpdate);

      if (userUpdate?.modifiedCount) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully updated user data"
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Something went wrong"
      );
    } catch (error) {
      //   console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }
}

module.exports = new UserController();
