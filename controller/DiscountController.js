const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../utils/common");
const DiscountModel = require("../model/Discount");
const BookModel = require("../model/Book");

class DiscountController {
  async createDiscount(req, res) {
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

      let { title, startTime, endTime, discountPercentage, books } = req.body;

      let x = new Date(startTime);
      console.log(
        ` ${x.getDate()}/${
          x.getMonth() + 1
        }/${x.getFullYear()}  ${x.getHours()}:${x.getMinutes()}:${x.getSeconds()}`
      );

      const booksToDiscount = await BookModel.find({
        _id: {
          $in: books,
        },
      });

      if (books?.length !== booksToDiscount?.length) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "All books to add discount not exist"
        );
      }

      const discountResult = await DiscountModel.create({
        title,
        startTime,
        endTime,
        discountPercentage,
        books,
      });

      if (!discountResult) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to create discount"
        );
      }

      const bulk = [];
      booksToDiscount.map((element) => {
        // console.log("element ", element);
        bulk.push({
          updateOne: {
            filter: { _id: element?._id },
            update: { $push: { discounts: discountResult?._id } },
          },
        });
      });

      const bookDiscountSave = await BookModel.bulkWrite(bulk);
      console.log(bookDiscountSave);

      if (discountResult && bookDiscountSave?.modifiedCount == books?.length) {
        return sendResponse(
          res,
          HTTP_STATUS.CREATED,
          "Successfully created discount"
        );
      }

      return sendResponse(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Something went wrong"
      );
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }
}

module.exports = new DiscountController();
