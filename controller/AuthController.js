const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const jsonwebtoken = require("jsonwebtoken");
const { sendResponse } = require("../utils/common");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const auth = await Auth.findOne({ email: email })
        .populate("user", "-createdAt -updatedAt")
        .select("-createdAt -updatedAt");
      // console.log(auth);
      // console.log(req.body);
      if (!auth) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User is not registered"
        );
      }
      const checkPassword = await bcrypt.compare(password, auth.password);

      if (!checkPassword) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid credentials"
        );
      }
      const responseAuth = auth.toObject();
      delete responseAuth.password;

      const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      responseAuth.token = jwt;
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "Successfully logged in",
        responseAuth
      );
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }

  async signup(req, res) {
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
      const { userName, email, password, phone, address, role } = req.body;
      // console.log(req.body);
      const auth = await Auth.findOne({
        $or: [{ email: email }, { userName: userName }],
      });
      if (auth?.email == email && auth?.userName == userName) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered and userName is not available"
        );
      } else if (auth?.email == email) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "Email is already registered"
        );
      } else if (auth?.userName == userName) {
        return sendResponse(
          res,
          HTTP_STATUS.CONFLICT,
          "userName is not available"
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
        return hash;
      });

      const user = await User.create({
        userName: userName,
        email: email,
        phone: phone,
        address: address,
      });
      const result = await Auth.create({
        email: email,
        password: hashedPassword,
        userName: userName,
        role: role,
        verified: false,
        user: user._id,
      });
      if (!result) {
        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          "Failed to add the user"
        );
      }

      return sendResponse(res, HTTP_STATUS.OK, "Successfully signed up", user);
    } catch (error) {
      // console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error"
      );
    }
  }
}

module.exports = new AuthController();
