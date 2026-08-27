const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    model: { type: String, required: true },
    category: { type: String, enum: ["Hatchback", "Sedan", "SUV", "Luxury"], required: true },
    transmission: { type: String, enum: ["Manual", "Automatic"], default: "Manual" },
    seatingCapacity: Number,
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "CNG"], default: "Petrol" },
    pricePerKm: Number,
    pricePerDay: { type: Number, required: true },
    currentLocation: { lat: Number, lng: Number, city: String },
    images: [String],
    driverIncluded: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

carSchema.index({ "currentLocation.city": 1 });

module.exports = mongoose.model("Car", carSchema);
