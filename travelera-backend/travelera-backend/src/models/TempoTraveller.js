const mongoose = require("mongoose");

const tempoTravellerSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    vehicleModel: { type: String, required: true },
    seatingCapacity: { type: Number, enum: [9, 12, 17], required: true },
    pricePerDay: Number,
    pricePerKm: Number,
    driverIncluded: { type: Boolean, default: true },
    currentLocation: { lat: Number, lng: Number, city: String },
    amenities: [String],
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

tempoTravellerSchema.index({ "currentLocation.city": 1 });

module.exports = mongoose.model("TempoTraveller", tempoTravellerSchema);
