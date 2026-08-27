class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

module.exports = ApiError;
