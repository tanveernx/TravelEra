const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /users/profile
const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { message: "Profile fetched", data: req.user });
});

// PATCH /users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...(name && { name }), ...(phone && { phone }) } },
    { new: true }
  );
  return ApiResponse.success(res, { message: "Profile updated", data: user });
});

// POST /users/avatar  (expects { avatarUrl } — wire up multer + Cloudinary upload before this in production)
const updateAvatar = asyncHandler(async (req, res) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl) throw new ApiError(400, "avatarUrl is required");
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
  return ApiResponse.success(res, { message: "Avatar updated", data: user });
});

// POST /users/saved-travelers
const addSavedTraveler = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { savedTravelers: req.body } },
    { new: true }
  );
  return ApiResponse.success(res, { statusCode: 201, message: "Traveler saved", data: user.savedTravelers });
});

// DELETE /users/saved-travelers/:id
const removeSavedTraveler = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedTravelers: { _id: req.params.id } } },
    { new: true }
  );
  return ApiResponse.success(res, { message: "Traveler removed", data: user.savedTravelers });
});

module.exports = { getProfile, updateProfile, updateAvatar, addSavedTraveler, removeSavedTraveler };
