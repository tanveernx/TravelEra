const mongoose = require("mongoose");

const ferryClassSchema = new mongoose.Schema(
  {
    className: { type: String, enum: ["Deck", "Cabin", "Luxury"], required: true },
    totalSeats: Number,
    price: { type: Number, required: true }
  },
  { _id: false }
);

const ferrySchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    ferryName: { type: String, required: true },
    classes: [ferryClassSchema],
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" }
  },
  { timestamps: true }
);

ferrySchema.index({ routeId: 1, departureTime: 1 });

module.exports = mongoose.model("Ferry", ferrySchema);
