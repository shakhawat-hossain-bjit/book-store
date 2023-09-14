const express = require("express");
const app = express();
var cors = require("cors");
const dotenv = require("dotenv");
const databaseConnection = require("./db/config");
const HTTP_STATUS = require("./constants/statusCodes");
const { sendResponse } = require("./utils/common");
const authRoute = require("./routes/Auth");
dotenv.config("dotenv");

app.use(cors({ origin: "*" }));
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.log(err);
    return res.status(400).send(failure("Invalid JSON provided"));
  }
  next();
});

app.use("/auth", authRoute);

app.get("/", async (req, res) => {
  return sendResponse(res, HTTP_STATUS.OK, "Route is working");
});

app.use("*", (req, res) => {
  return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "There is no such route");
});

databaseConnection(() => {
  app.listen(8000, () => {
    let date = new Date();
    console.log(
      `App is running on port 8000 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `
    );
  });
});
