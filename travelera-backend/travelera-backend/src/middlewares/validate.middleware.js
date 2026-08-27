const ApiError = require("../utils/ApiError");

// Usage: validate(zodSchema) as route middleware — validates req.body
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw new ApiError(400, "Validation failed", errors);
  }
  req.body = result.data;
  next();
};

module.exports = validate;
