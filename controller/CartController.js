const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const CartModel = require("../model/Cart");
const BookModel = require("../model/Book");
const UserModel = require("../model/User");
const { sendResponse } = require("../utils/common");

class CartController {
  async getCart(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById({ _id: userId });
      if (!user) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
      }
      const cart = await CartModel.findOne({ user: userId }).populate(
        "books.book"
      );
      if (!cart) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Cart does not exist for user"
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully got cart for user",
        cart
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

  async addBookToCart(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the Book",
          validation
        );
      }

      let { userId, bookId, amount } = req.body;
      amount = parseInt(amount);

      const user = await UserModel.findById({ _id: userId });
      //check if user exist
      if (!user) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
      }

      let cart = await CartModel.findOne({ user: userId });
      const book = await BookModel.findById({ _id: bookId })
        .populate("discounts", " -books -createdAt -updatedAt  -__v ")
        .select("-createdAt -updatedAt -__v");

      let currentTime = new Date();
      let discountSum = book?.discounts?.reduce((total, discount) => {
        if (
          discount?.startTime <= currentTime &&
          currentTime <= discount?.endTime
        ) {
          console.log("here");
          return total + discount?.discountPercentage;
        }
        return total;
      }, 0);

      // console.log(book.price);
      // console.log("discountSum ", discountSum);
      if (discountSum <= 100) {
        book.price = Number(
          (book.price - book.price * (discountSum / 100)).toFixed(2)
        );
      }

      //check if book exist
      if (!book) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Book with ID was not found"
        );
      }

      if (book.stock < amount) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Not enough Books are in stock"
        );
      }

      if (!cart) {
        // console.log("cart ", cart);
        let newCart = await CartModel.create({
          user: userId,
          books: [{ book: bookId, quantity: amount }],
        });
        // console.log("newCart ", newCart);
        newCart = newCart.toObject();
        // console.log("book.price ", book.price);
        newCart.total = book.price;
        if (newCart) {
          return sendResponse(
            res,
            HTTP_STATUS.OK,
            "Added item to a new cart",
            newCart
          );
        }
      }

      const bookIndex = cart?.books?.findIndex(
        (element) => String(element.book) === bookId
      );

      if (bookIndex !== -1) {
        if (book.stock < cart?.books[bookIndex]?.quantity + amount) {
          return sendResponse(
            res,
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "Not enough Books are in stock"
          );
        }
        cart.books[bookIndex].quantity += amount;
      } else {
        cart.books.push({ book: bookId, quantity: amount });
      }

      await cart.save();
      // console.log("cart ", cart);
      let quantity = {};
      const bookList = cart?.books?.map((x) => {
        // console.log("x ", x);
        let subObj = { quantity: x.quantity };
        quantity[`${x?.book._id}`] = subObj;
        return x.book;
      });
      console.log("quantity ", quantity);

      //find all the books that are in the cart
      const booksInCart = await BookModel.find({
        _id: {
          $in: bookList,
        },
      })
        .populate("discounts", " -books -createdAt -updatedAt  -__v ")
        .select("price _id title");

      // console.log(booksInCart);
      let price = {};
      //books map
      booksInCart.map((book) => {
        //discounts map
        let discountSum = book?.discounts?.reduce((total, discount) => {
          if (
            discount?.startTime <= currentTime &&
            currentTime <= discount?.endTime
          ) {
            return total + discount?.discountPercentage;
          }
          return total;
        }, 0);
        // discouunt 100 er besi hole sei product dekhano jabe na
        if (discountSum <= 100) {
          book.price = Number(
            (book.price - book.price * (discountSum / 100)).toFixed(2)
          );
          let subObj = { price: book.price };
          price[`${book._id}`] = subObj;
          // return obj;
        }
      });
      console.log("price ", price);
      cart = cart.toObject();
      console.log(cart);
      let totalPrice = 0;
      let priceAddedBooks = cart?.books?.map((x) => {
        let id = x.book;
        console.log("my ", price[`${id}`].price);
        x.price = price[`${id}`].price;
        totalPrice += x?.price * x?.quantity;
        return x;
      });

      console.log(priceAddedBooks);
      cart.books = priceAddedBooks;
      cart.totalPrice = Number(totalPrice.toFixed(2));

      return sendResponse(
        res,
        HTTP_STATUS.CREATED,
        "Added item to existing cart",
        cart
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

  async removeBookFromCart(req, res) {
    try {
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to remove the Book",
          validation
        );
      }

      let { userId, bookId, amount } = req.body;
      amount = parseInt(amount);

      const user = await UserModel.findById({ _id: userId });

      if (!user) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
      }

      const cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Cart was not found for this user"
        );
      }

      const book = await BookModel.findById({ _id: bookId });

      if (!book) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Book with ID was not found"
        );
      }

      const bookExistIntex = cart.books.findIndex(
        (element) => String(element.book) === bookId
      );
      if (bookExistIntex === -1) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Book was not found in cart"
        );
      }

      //  trying to order more book greater than stock
      if (cart.books[bookExistIntex].quantity < amount) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Book does not exist in the cart enough times"
        );
      }

      //  trying to order  book equal to stock
      if (cart.books[bookExistIntex].quantity === amount) {
        cart.books.splice(bookExistIntex, 1);
        cart.total = Number((cart.total - book.price * amount).toFixed(2));
        await cart.save();
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Book removed from cart",
          cart
        );
      }
      //  trying to order  book less than stock
      if (cart.books[bookExistIntex].quantity > amount) {
        cart.books[bookExistIntex].quantity -= amount;
        cart.total = Number((cart.total - book.price * amount).toFixed(2));
        await cart.save();
        return sendResponse(res, HTTP_STATUS.OK, "Book reduced in cart", cart);
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

module.exports = new CartController();
