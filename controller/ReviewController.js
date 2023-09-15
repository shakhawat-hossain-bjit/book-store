const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const ReviewModel = require("../model/Review");
const BookModel = require("../model/Book");
const { sendResponse } = require("../utils/common");

class ReviewController {
  async create(req, res) {
    try {
      // express validator
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the product",
          validation
        );
      }
      let { userId, bookId, content, rating } = req.body;

      //check if the review already exist
      const existReview = await ReviewModel.findOne({ userId, bookId });
      if (existReview) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "You have already reviewd. Now you may modify your review"
        );
      }

      //check if the product exist
      const book = await BookModel.findOne({ _id: bookId });
      if (!book) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book is not exist");
      }

      // creating review
      let review = new ReviewModel({
        userId,
        bookId,
        content,
        rating,
      });
      let newReview = await review.save();

      // if review is created then update rating and reviewCount
      if (newReview?._id) {
        // console.log(newReview);
        let { rating: previousRating = 0, reviewCount = 0 } = book;
        rating = (
          (previousRating * reviewCount + parseFloat(rating)) /
          (reviewCount + 1)
        ).toFixed(2);
        reviewCount++;

        await BookModel.updateOne(
          { _id: bookId },
          { $set: { reviewCount, rating }, $push: { reviews: newReview?._id } }
        );
        return sendResponse(res, HTTP_STATUS.OK, "Successfully added review");
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

module.exports = new ReviewController();
