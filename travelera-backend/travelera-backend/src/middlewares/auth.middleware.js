const { verifyAccessToken } = require("../services/token.service");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

// Verifies JWT access token from Authorization header
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) throw new ApiError(401, "Access token missing");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Access token expired or invalid");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User not found");

  req.user = user;
  next();
});

// Restricts access to specific roles: authorize("admin"), authorize("admin", "operator")
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { authenticate, authorize };
