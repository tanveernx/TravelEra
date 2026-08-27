const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true }, // email or phone
    otp: { type: String, required: true, select: false }, // hashed
    purpose: { type: String, enum: ["register", "login", "reset_password"], required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
