const mongoose = require("mongoose");

const travelerSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    seatNumber: String,
    idProofType: String,
    idProofNumber: String
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    travelType: {
      type: String,
      enum: ["bus", "car", "flight", "train", "ferry", "tempo", "cab", "bike"],
      required: true
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // busId/carId/flightId/... or rideId
    travelers: [travelerSchema],
    journeyDate: Date,
    source: String,
    destination: String,
    fare: {
      baseFare: Number,
      taxes: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      totalFare: { type: Number, required: true }
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    seatLockKeys: [String], // internal use — released on confirm/cancel
    ticketUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
