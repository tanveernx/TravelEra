const jwt = require("jsonwebtoken");
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY
} = require("../config/env");

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
