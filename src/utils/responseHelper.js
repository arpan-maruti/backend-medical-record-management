export const sendSuccess = (res, statusCode = 200, { code, message, data, ...extra } = {}) => {
  // console.log(data);
  const response = { success: true };
  if (code) response.code = code;
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json({ ...response, ...extra });
};

export const sendError = (res, statusCode = 400, { code, message, error, data, ...extra } = {}) => {
  const response = { success: false };
  if (code) response.code = code;
  if (message) response.message = message;
  // Include error details as before (if passed)
  if (error) response.error = error;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json({ ...response, ...extra });
};