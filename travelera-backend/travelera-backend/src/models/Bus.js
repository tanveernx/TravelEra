const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: String,
    type: String,
    isAvailable: { type: Boolean, default: true },
    price: Number,
    deck: { type: String, enum: ["lower", "upper"], default: "lower" }
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    busNumber: { type: String, required: true },
    busType: {
      type: String,
      enum: ["AC Sleeper", "Non-AC Seater", "AC Seater", "Sleeper"],
      required: true
    },
    totalSeats: Number,
    seatLayout: [seatSchema],
    amenities: [String],
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    basePrice: { type: Number, required: true },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" }
  },
  { timestamps: true }
);

busSchema.index({ routeId: 1, departureTime: 1 });

module.exports = mongoose.model("Bus", busSchema);
