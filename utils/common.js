const sendResponse = (res, status, message, result = null) => {
  const response = {};
  if (status >= 400) {
    response.success = false;
    response.error = result;
    response.message = "Internal server error";
  }
  // if (status >= 300) {
  //   response.warning = false;
  //   response.error = result;
  //   response.message = "";
  // }
  else {
    response.success = true;
    response.data = result;
    response.message = "Successfully completed operations";
  }

  if (message) {
    response.message = message;
  }
  res.status(status).send(response);
};

module.exports = { sendResponse };
