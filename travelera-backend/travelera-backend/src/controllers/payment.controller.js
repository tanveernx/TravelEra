const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const paymentService = require("../services/payment.service");
const bookingService = require("../services/booking.service");
const { sendBookingConfirmationEmail } = require("../services/email.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// POST /payments/create-order  { bookingId }
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status !== "pending") throw new ApiError(400, "Booking is not payable");

  const order = await paymentService.createOrder({
    amount: booking.fare.totalFare,
    receipt: booking.bookingId
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: req.user._id,
    gateway: "razorpay",
    orderId: order.id,
    amount: booking.fare.totalFare,
    status: "initiated"
  });

  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Payment order created",
    data: { order, paymentId: payment._id }
  });
});

// POST /payments/verify  { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment record not found");

  const isValid = paymentService.verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  });

  if (!isValid) {
    payment.status = "failed";
    await payment.save();
    throw new ApiError(400, "Payment verification failed");
  }

  payment.status = "success";
  payment.transactionId = razorpayPaymentId;
  await payment.save();

  const booking = await bookingService.confirmBooking(payment.bookingId, payment._id);

  const user = req.user;
  sendBookingConfirmationEmail(user.email, booking).catch(() => {});

  return ApiResponse.success(res, { message: "Payment verified, booking confirmed", data: { payment, booking } });
});

// POST /payments/webhook (gateway -> server notification; signature check omitted for brevity)
const webhook = asyncHandler(async (req, res) => {
  // In production: verify X-Razorpay-Signature header against RAZORPAY_KEY_SECRET
  return ApiResponse.success(res, { message: "Webhook received" });
});

// POST /payments/:id/refund  (admin)
const refund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, "Payment not found");

  payment.status = "refunded";
  payment.refundDetails = { amount: amount || payment.amount, reason, processedAt: new Date() };
  await payment.save();

  await Booking.updateOne({ _id: payment.bookingId }, { status: "cancelled" });

  return ApiResponse.success(res, { message: "Refund processed", data: payment });
});

module.exports = { createOrder, verifyPayment, webhook, refund };
