const sendResponse = (res, code, msg, data = null) => {
  const response = {
    code,
    msg,
  };
  if (data !== null) {
    response.data = data;
  }
  res.status(code).send(response);
};
module.exports = sendResponse;
