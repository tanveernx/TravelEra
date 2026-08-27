class ApiResponse {
  static success(res, { message = "Success", data = {}, meta = null, statusCode = 200 } = {}) {
    const payload = { success: true, message, data };
    if (meta) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }

  static error(res, { message = "Something went wrong", statusCode = 500, errors = null } = {}) {
    const payload = { success: false, message };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
