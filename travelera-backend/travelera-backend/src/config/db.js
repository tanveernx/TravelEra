const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);
    console.log(`[MongoDB] Connected -> ${MONGO_URI}`);
  } catch (err) {
    console.error("[MongoDB] Connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
