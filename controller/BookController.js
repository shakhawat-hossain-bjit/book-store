const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const BookModel = require("../model/Books");
const Book = require("../model/Books");
const { sendResponse } = require("../utils/common");
const { insertInLog } = require("../server/logFile");

class BookController {
  async getAll(req, res) {
    try {
      const books = await Book.find({});
      insertInLog(req);
      // writeLog(req);
      // .sort({
      //   [sortParam]: sortOrder === "asc" ? 1 : -1,
      // })
      // .skip((page - 1) * limit)
      // .limit(limit ? limit : 100);
      if (books.length === 0) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No products were found"
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully got all products",
        {
          //   total: productCount,
          //   count: products.length,
          //   page: parseInt(page),
          //   limit: parseInt(limit),
          books: books,
        }
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

  async create(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the product",
          validation
        );
      }
      const {
        author,
        title,
        country,
        imageLink,
        language,
        link,
        pages,
        year,
        price,
        rating,
        reviewCount,
        category,
        stock,
      } = req.body;

      const existingProduct = await BookModel.findOne({ title: title });

      if (existingProduct) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Product with same title already exists"
        );
      }

      const newBook = await BookModel.create({
        author,
        title,
        country,
        imageLink,
        language,
        link,
        pages,
        year,
        price,
        rating,
        reviewCount,
        category,
        stock,
      });
      console.log(newBook);

      if (newBook) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Successfully added book",
          newBook
        );
      }
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

module.exports = new BookController();
