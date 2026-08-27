const mongoose = require("mongoose");

const operatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["bus", "car", "flight", "train", "ferry", "tempo"]
    },
    logo: { type: String, default: "" },
    contact: { email: String, phone: String },
    rating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operator", operatorSchema);
