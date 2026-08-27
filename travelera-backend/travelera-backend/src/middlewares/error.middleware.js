const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    error = new ApiError(statusCode, error.message || "Internal Server Error");
  }

  if (process.env.NODE_ENV !== "production") {
    logger.error(err.stack || err.message);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || undefined
  });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorMiddleware, notFoundMiddleware };
