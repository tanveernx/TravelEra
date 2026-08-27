const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    rideType: { type: String, enum: ["cab", "bike"], required: true },
    vehicleDetails: { model: String, plateNumber: String },
    pickupLocation: { lat: Number, lng: Number, address: String },
    dropLocation: { lat: Number, lng: Number, address: String },
    distanceKm: Number,
    estimatedDuration: Number, // minutes
    fare: {
      baseFare: Number,
      perKmRate: Number,
      surge: { type: Number, default: 1 },
      totalFare: Number
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "ongoing", "completed", "cancelled"],
      default: "requested"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
