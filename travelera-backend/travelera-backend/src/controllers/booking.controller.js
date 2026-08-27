const Booking = require("../models/Booking");
const bookingService = require("../services/booking.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

function makeScheduledBookingHandler(travelType) {
  return asyncHandler(async (req, res) => {
    const { referenceId, travelers, journeyDate, seatNumbers, className } = req.body;
    if (!referenceId) throw new ApiError(400, "referenceId is required");

    const booking = await bookingService.createScheduledBooking({
      travelType,
      referenceId,
      userId: req.user._id,
      travelers: travelers || [],
      journeyDate,
      seatNumbers: seatNumbers || [],
      className
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: `${travelType} booking created (pending payment)`,
      data: booking
    });
  });
}

const createBusBooking = makeScheduledBookingHandler("bus");
const createCarBooking = makeScheduledBookingHandler("car");
const createFlightBooking = makeScheduledBookingHandler("flight");
const createTrainBooking = makeScheduledBookingHandler("train");
const createFerryBooking = makeScheduledBookingHandler("ferry");
const createTempoBooking = makeScheduledBookingHandler("tempo");

// GET /bookings
const listMyBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { userId: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Booking.countDocuments(query);

  return ApiResponse.success(res, {
    message: "Bookings fetched successfully",
    data: bookings,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

// GET /bookings/:id
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
  if (!booking) throw new ApiError(404, "Booking not found");
  return ApiResponse.success(res, { message: "Booking fetched successfully", data: booking });
});

// PATCH /bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  return ApiResponse.success(res, { message: "Booking cancelled successfully", data: booking });
});

// GET /bookings/:id/ticket  (stub — returns booking JSON; wire up pdfkit/puppeteer for real PDF)
const downloadTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status !== "confirmed") throw new ApiError(400, "Ticket only available for confirmed bookings");

  return ApiResponse.success(res, {
    message: "Ticket data (wire up pdfkit/puppeteer in ticket.service.js to render a real PDF)",
    data: booking
  });
});

module.exports = {
  createBusBooking,
  createCarBooking,
  createFlightBooking,
  createTrainBooking,
  createFerryBooking,
  createTempoBooking,
  listMyBookings,
  getBooking,
  cancelBooking,
  downloadTicket
};
