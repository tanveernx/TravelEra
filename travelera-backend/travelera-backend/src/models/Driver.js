const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ["cab", "bike"], required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 5 },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

driverSchema.index({ currentLocation: "2dsphere" });
driverSchema.index({ isAvailable: 1, vehicleType: 1 });

module.exports = mongoose.model("Driver", driverSchema);
