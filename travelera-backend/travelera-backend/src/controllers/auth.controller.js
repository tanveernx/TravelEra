const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Otp = require("../models/Otp");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../services/token.service");
const { sendOtpEmail } = require("../services/email.service");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueOtp(identifier, purpose) {
  const otp = generateOtp();
  await Otp.deleteMany({ identifier, purpose });
  await Otp.create({
    identifier,
    otp: hashOtp(otp),
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  return otp;
}

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) throw new ApiError(409, "User with this email or phone already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, phone, password: hashedPassword });

  const otp = await issueOtp(email, "register");
  await sendOtpEmail(email, otp, "register");

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Registered successfully. OTP sent to email for verification.",
    data: { userId: user._id, email: user.email }
  });
});

// POST /auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { identifier, otp, purpose } = req.body;

  const record = await Otp.findOne({ identifier, purpose }).select("+otp");
  if (!record) throw new ApiError(400, "OTP not found or expired");
  if (record.expiresAt < new Date()) throw new ApiError(400, "OTP expired");
  if (hashOtp(otp) !== record.otp) throw new ApiError(400, "Invalid OTP");

  await Otp.deleteOne({ _id: record._id });

  if (purpose === "register") {
    await User.updateOne({ email: identifier }, { isVerified: true });
  }

  return ApiResponse.success(res, { message: "OTP verified successfully" });
});

// POST /auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { identifier, purpose = "register" } = req.body;
  const otp = await issueOtp(identifier, purpose);
  await sendOtpEmail(identifier, otp, purpose);
  return ApiResponse.success(res, { message: "OTP resent successfully" });
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }).select(
    "+password +refreshTokens"
  );
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefresh = crypto.createHash("sha256").update(refreshToken).digest("hex");
  user.refreshTokens.push(hashedRefresh);
  await user.save();

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return ApiResponse.success(res, {
    message: "Login successful",
    data: {
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    }
  });
});

// POST /auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const hashedRefresh = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(hashedRefresh)) {
    throw new ApiError(401, "Refresh token not recognized — please login again");
  }

  const accessToken = generateAccessToken(user);
  return ApiResponse.success(res, { message: "Access token refreshed", data: { accessToken } });
});

// POST /auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const hashedRefresh = crypto.createHash("sha256").update(token).digest("hex");
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: hashedRefresh } });
  }
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  return ApiResponse.success(res, { message: "Logged out successfully" });
});

// POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
  if (!user) return ApiResponse.success(res, { message: "If the account exists, an OTP has been sent." });

  const otp = await issueOtp(user.email, "reset_password");
  await sendOtpEmail(user.email, otp, "reset_password");
  return ApiResponse.success(res, { message: "If the account exists, an OTP has been sent." });
});

// POST /auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { identifier, otp, newPassword } = req.body;

  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
  if (!user) throw new ApiError(400, "Invalid request");

  const record = await Otp.findOne({ identifier: user.email, purpose: "reset_password" }).select("+otp");
  if (!record || record.expiresAt < new Date()) throw new ApiError(400, "OTP expired or not found");
  if (hashOtp(otp) !== record.otp) throw new ApiError(400, "Invalid OTP");

  user.password = await bcrypt.hash(newPassword, 12);
  user.refreshTokens = []; // force re-login everywhere
  await user.save();
  await Otp.deleteOne({ _id: record._id });

  return ApiResponse.success(res, { message: "Password reset successfully. Please login again." });
});

// GET /auth/me
const me = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { message: "Current user", data: { user: req.user } });
});

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me
};
