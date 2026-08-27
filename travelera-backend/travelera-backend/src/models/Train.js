const mongoose = require("mongoose");

const trainClassSchema = new mongoose.Schema(
  {
    className: { type: String, enum: ["SL", "3A", "2A", "1A", "General"], required: true },
    totalSeats: Number,
    availableSeats: Number,
    price: { type: Number, required: true }
  },
  { _id: false }
);

const trainSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    trainNumber: { type: String, required: true },
    trainName: { type: String, required: true },
    classes: [trainClassSchema],
    runningDays: [{ type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" }
  },
  { timestamps: true }
);

trainSchema.index({ routeId: 1, departureTime: 1 });

module.exports = mongoose.model("Train", trainSchema);
