const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Operator", required: true },
    source: { city: String, terminal: String, lat: Number, lng: Number },
    destination: { city: String, terminal: String, lat: Number, lng: Number },
    distanceKm: Number,
    estimatedDuration: Number, // minutes
    stops: [{ city: String, arrivalOffsetMin: Number }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);
