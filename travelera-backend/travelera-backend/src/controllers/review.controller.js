const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// POST /reviews  { bookingId, operatorId, rating, comment }
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, operatorId, rating, comment } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id, status: "completed" });
  if (!booking) throw new ApiError(400, "You can only review completed bookings");

  const review = await Review.create({ userId: req.user._id, bookingId, operatorId, rating, comment });
  return ApiResponse.success(res, { statusCode: 201, message: "Review submitted", data: review });
});

// GET /reviews/operator/:id
const getOperatorReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ operatorId: req.params.id })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 });
  return ApiResponse.success(res, { message: "Reviews fetched", data: reviews });
});

module.exports = { createReview, getOperatorReviews };
