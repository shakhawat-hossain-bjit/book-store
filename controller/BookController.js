const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const BookModel = require("../model/Book");
const { sendResponse } = require("../utils/common");
const { insertInLog } = require("../server/logFile");

class BookController {
  async getAll(req, res) {
    try {
      const {
        sortParam,
        sortOrder,
        search,
        languageSearch,
        category,
        price,
        priceFil,
        stock,
        stockFil,
        rating,
        ratingFil,
        page,
        limit,
      } = req.query;
      if (page < 1 || limit < 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Page and limit values must be at least 1"
        );
      }
      if (
        (sortOrder && !sortParam) ||
        (!sortOrder && sortParam) ||
        (sortParam &&
          sortParam !== "pages" &&
          sortParam !== "year" &&
          sortParam !== "title" &&
          sortParam !== "rating" &&
          sortParam !== "reviewCount" &&
          sortParam !== "stock" &&
          sortParam !== "price") ||
        (sortOrder && sortOrder !== "asc" && sortOrder !== "desc")
      ) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Invalid sort parameters provided"
        );
      }
      const filter = {};

      if (price && priceFil) {
        if (priceFil === "low") {
          filter.price = { $lte: parseFloat(price) };
        } else {
          filter.price = { $gte: parseFloat(price) };
        }
      }
      if (stock && stockFil) {
        if (stockFil === "low") {
          filter.stock = { $lte: parseFloat(stock) };
        } else {
          filter.stock = { $gte: parseFloat(stock) };
        }
      }
      if (rating && ratingFil) {
        if (ratingFil === "low") {
          filter.rating = { $lte: parseFloat(rating) };
        } else {
          filter.rating = { $gte: parseFloat(rating) };
        }
      }

      if (category) {
        filter.category = { $in: category.toLowerCase() };
      }
      if (search) {
        filter["$or"] = [
          { author: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const bookCount = await BookModel.find().count();
      const filteredBookCount = await BookModel.find(filter).count();
      const books = await BookModel.find(filter)
        .sort({
          [sortParam]: sortOrder === "asc" ? 1 : -1,
        })
        .skip((page - 1) * limit)
        .limit(limit ? limit : 100)
        .select("-createdAt -updatedAt -__v");

      // insertInLog(req);

      if (books.length === 0) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No Books were found");
      }

      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully got all products",
        {
          totalBook: bookCount,
          filteredBookCount: filteredBookCount,
          count: books.length,
          page: parseInt(page),
          limit: parseInt(limit),
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
          "Book with same title already exists"
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
      // console.log(newBook);

      if (newBook) {
        return sendResponse(
          res,
          HTTP_STATUS.CREATED,
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

  async update(req, res) {
    try {
      // const validation = validationResult(req).array();
      // if (validation.length > 0) {
      //   return sendResponse(
      //     res,
      //     HTTP_STATUS.UNPROCESSABLE_ENTITY,
      //     "Failed to add the product",
      //     validation
      //   );
      // }

      const { bookId } = req.params;
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

      const existBook = await BookModel.findOne({ _id: bookId });

      if (!existBook) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book not exist");
      }

      let bookUpdateResult = await BookModel.updateOne(
        { _id: bookId },
        {
          $set: {
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
          },
        }
      );
      console.log(bookUpdateResult);
      if (bookUpdateResult?.modifiedCount) {
        return sendResponse(res, HTTP_STATUS.OK, "Book updated successfully");
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
  async delete(req, res) {
    try {
      // const validation = validationResult(req).array();
      // if (validation.length > 0) {
      //   return sendResponse(
      //     res,
      //     HTTP_STATUS.UNPROCESSABLE_ENTITY,
      //     "Failed to add the product",
      //     validation
      //   );
      // }

      const { bookId } = req.params;

      let bookDeleted = await BookModel.deleteOne({ _id: bookId });
      console.log(bookDeleted);

      if (bookDeleted?.deletedCount) {
        return sendResponse(res, HTTP_STATUS.OK, "Book deleted successfully");
      } else {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book not found");
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
