const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gateway: { type: String, enum: ["razorpay", "stripe", "wallet"], default: "razorpay" },
    orderId: String,
    transactionId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated"
    },
    refundDetails: {
      amount: Number,
      reason: String,
      processedAt: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
