const fs = require("fs");
const path = require("path");

async function readLogFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    // console.log("my data ", data);
    jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}

async function writeFile(filePath, data) {
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data), "utf-8");
  } catch (error) {
    throw new Error(`Error writing file: ${error.message}`);
  }
}

function getTime() {
  const date = new Date();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const time =
    date.getUTCHours() +
    ":" +
    ("0" + date.getUTCMinutes()).slice(-2) +
    ":" +
    ("0" + date.getUTCSeconds()).slice(-2);
  const timeZone = date.toString().match(/\((.*?)\)/)[1];

  const formattedDate = `${dayOfWeek} ${month} ${day} ${year} ${time} GMT${
    date.getTimezoneOffset() / -60 > 0 ? "+" : "-"
  }${("0" + date.getTimezoneOffset() / -60).slice(-2)}00 (${timeZone})`;

  //   console.log(formattedDate);
  return formattedDate;
}

async function insertInLog(operation, parameter = null) {
  try {
    let time = getTime();
    const user = getCurrentUser();
    let message;
    // message = {
    //   operation,
    //   requester: user,
    //   time,
    // };

    // if (
    //   operation == "GET_ONE_PRODUCT" ||
    //   operation == "POST_PRODUCT" ||
    //   operation == "DELETE_PRODUCT" ||
    //   operation == "UPDATE_PRODUCT" ||
    //   operation == "GET_ORDERS_FOR_USER" ||
    //   operation == "GET_ONE_ORDER"
    // ) {
    //   message.id = parameter;
    // }
    // if (operation == "FILTER_PRICE") {
    //   message.price = parameter;
    // }
    // if (operation == "LOG_IN" || operation == "SIGN_UP") {
    //   message.email = parameter;
    // }

    const filePath = path.join(__dirname, "log.txt");
    const fileData = await readLogFile(filePath);
    fileData += message + "\n\n";
    const result = await writeFile(filePath, fileData);
    return { success: true };
  } catch (error) {
    console.error(error.message);
    return { success: false };
  }
}

module.exports = { insertInLog, getTime };
