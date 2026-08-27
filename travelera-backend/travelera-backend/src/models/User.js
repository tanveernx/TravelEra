const mongoose = require("mongoose");

const savedTravelerSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    idProofType: String,
    idProofNumber: String
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "operator", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    savedTravelers: [savedTravelerSchema],
    wallet: { balance: { type: Number, default: 0 } },
    refreshTokens: [{ type: String, select: false }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
