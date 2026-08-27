const mongoose = require("mongoose");

const flightClassSchema = new mongoose.Schema(
  {
    className: { type: String, enum: ["Economy", "Premium Economy", "Business"], required: true },
    totalSeats: Number,
    availableSeats: Number,
    price: { type: Number, required: true }
  },
  { _id: false }
);

const flightSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    flightNumber: { type: String, required: true },
    source: { airportCode: String, city: String },
    destination: { airportCode: String, city: String },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: Number,
    stops: { type: Number, default: 0 },
    classes: [flightClassSchema],
    baggage: { cabin: String, checkin: String },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" }
  },
  { timestamps: true }
);

flightSchema.index({ "source.city": 1, "destination.city": 1, departureTime: 1 });

module.exports = mongoose.model("Flight", flightSchema);
