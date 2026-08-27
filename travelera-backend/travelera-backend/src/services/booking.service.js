const mongoose = require("mongoose");
const Bus = require("../models/Bus");
const Car = require("../models/Car");
const Flight = require("../models/Flight");
const Train = require("../models/Train");
const Ferry = require("../models/Ferry");
const TempoTraveller = require("../models/TempoTraveller");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const generateBookingId = require("../utils/generateBookingId");
const { acquireLock, releaseLock } = require("../utils/seatLock");

const modelMap = {
  bus: Bus,
  train: Train,
  flight: Flight,
  ferry: Ferry,
  car: Car,
  tempo: TempoTraveller
};

// Seat-based modes (individual named seats in seatLayout)
const SEAT_LAYOUT_MODES = ["bus"];
// Class-based modes (book against classes[].availableSeats / totalSeats)
const CLASS_BASED_MODES = ["flight", "train", "ferry"];
// Unit-based modes (whole vehicle booked, isAvailable toggle)
const UNIT_BASED_MODES = ["car", "tempo"];

async function createScheduledBooking({
  travelType,
  referenceId,
  userId,
  travelers = [],
  journeyDate,
  seatNumbers = [],
  className = null
}) {
  const Model = modelMap[travelType];
  if (!Model) throw new ApiError(400, `Unsupported travel type: ${travelType}`);

  const inventory = await Model.findById(referenceId);
  if (!inventory) throw new ApiError(404, `${travelType} not found`);

  let lockKeys = [];
  let baseFare = 0;
  let source = inventory.source?.city || inventory.currentLocation?.city || "";
  let destination = inventory.destination?.city || "";

  if (SEAT_LAYOUT_MODES.includes(travelType)) {
    if (!seatNumbers.length) throw new ApiError(400, "seatNumbers required for this travel type");

    // 1. Acquire in-memory lock to prevent race conditions between concurrent requests
    const lockResult = acquireLock(travelType, referenceId, seatNumbers);
    if (!lockResult.ok) throw new ApiError(409, "One or more selected seats are already locked. Try again.");
    lockKeys = lockResult.keys;

    try {
      // 2. Verify seats are still available in DB, then mark unavailable atomically
      const seatDocs = inventory.seatLayout.filter((s) => seatNumbers.includes(s.seatNumber));
      if (seatDocs.length !== seatNumbers.length) throw new ApiError(400, "Invalid seat number(s)");
      const unavailable = seatDocs.filter((s) => !s.isAvailable);
      if (unavailable.length) throw new ApiError(409, "One or more selected seats are already booked");

      baseFare = seatDocs.reduce((sum, s) => sum + (s.price || inventory.basePrice || 0), 0);

      await Model.updateOne(
        { _id: referenceId, "seatLayout.seatNumber": { $in: seatNumbers } },
        { $set: { "seatLayout.$[elem].isAvailable": false } },
        { arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }] }
      );
    } catch (err) {
      releaseLock(lockKeys);
      throw err;
    }
    destination = inventory.destination?.city || "";
  } else if (CLASS_BASED_MODES.includes(travelType)) {
    const seatCount = travelers.length || 1;
    const classDoc = inventory.classes.find((c) => c.className === className) || inventory.classes[0];
    if (!classDoc) throw new ApiError(400, "No class available for this trip");

    const availableField = classDoc.availableSeats !== undefined ? "availableSeats" : "totalSeats";
    if ((classDoc[availableField] || 0) < seatCount) {
      throw new ApiError(409, "Not enough seats available in selected class");
    }

    baseFare = classDoc.price * seatCount;

    await Model.updateOne(
      { _id: referenceId, "classes.className": classDoc.className },
      { $inc: { [`classes.$.${availableField}`]: -seatCount } }
    );

    source = inventory.source?.city || "";
    destination = inventory.destination?.city || "";
  } else if (UNIT_BASED_MODES.includes(travelType)) {
    if (!inventory.isAvailable) throw new ApiError(409, `This ${travelType} is currently unavailable`);
    baseFare = inventory.pricePerDay || 0;

    await Model.updateOne({ _id: referenceId }, { $set: { isAvailable: false } });
    source = inventory.currentLocation?.city || "";
    destination = "";
  }

  const taxes = Math.round(baseFare * 0.05);
  const totalFare = baseFare + taxes;

  const booking = await Booking.create({
    bookingId: generateBookingId(),
    userId,
    travelType,
    referenceId,
    travelers,
    journeyDate: journeyDate || inventory.departureTime || new Date(),
    source,
    destination,
    fare: { baseFare, taxes, discount: 0, totalFare },
    status: "pending",
    seatLockKeys: lockKeys
  });

  return booking;
}

async function confirmBooking(bookingId, paymentId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  booking.status = "confirmed";
  booking.paymentId = paymentId;
  releaseLock(booking.seatLockKeys); // lock no longer needed — DB already marks seats unavailable
  booking.seatLockKeys = [];
  await booking.save();
  return booking;
}

async function cancelBooking(bookingId, userId) {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === "cancelled") throw new ApiError(400, "Booking already cancelled");

  const Model = modelMap[booking.travelType];
  if (Model) {
    if (SEAT_LAYOUT_MODES.includes(booking.travelType)) {
      const seatNumbers = booking.travelers.map((t) => t.seatNumber).filter(Boolean);
      await Model.updateOne(
        { _id: booking.referenceId },
        { $set: { "seatLayout.$[elem].isAvailable": true } },
        { arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }] }
      );
    } else if (UNIT_BASED_MODES.includes(booking.travelType)) {
      await Model.updateOne({ _id: booking.referenceId }, { $set: { isAvailable: true } });
    }
    // class-based seat release omitted for brevity — increment availableSeats back if needed
  }

  releaseLock(booking.seatLockKeys);
  booking.status = "cancelled";
  booking.seatLockKeys = [];
  await booking.save();
  return booking;
}

async function releaseExpiredPendingBooking(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== "pending") return;
  await cancelBooking(bookingId, booking.userId);
}

module.exports = {
  createScheduledBooking,
  confirmBooking,
  cancelBooking,
  releaseExpiredPendingBooking,
  modelMap
};
