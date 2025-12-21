const success = (res, data = null, message = null, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== null && data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = 400) => {
  const response = { success: false, message };
  return res.status(statusCode).json(response);
};

module.exports = { success, error };
