const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateBookingId = require("../utils/generateBookingId");

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /rides/request  { rideType, pickupLocation, dropLocation }
const requestRide = asyncHandler(async (req, res) => {
  const { rideType, pickupLocation, dropLocation } = req.body;
  if (!pickupLocation || !dropLocation) throw new ApiError(400, "pickupLocation and dropLocation are required");

  const nearestDriver = await Driver.findOne({
    vehicleType: rideType,
    isAvailable: true,
    currentLocation: {
      $near: {
        $geometry: { type: "Point", coordinates: [pickupLocation.lng, pickupLocation.lat] },
        $maxDistance: 8000
      }
    }
  });

  const distanceKm = haversineKm(
    pickupLocation.lat,
    pickupLocation.lng,
    dropLocation.lat,
    dropLocation.lng
  );
  const baseFare = rideType === "bike" ? 20 : 40;
  const perKmRate = rideType === "bike" ? 6 : 12;
  const totalFare = Math.round(baseFare + distanceKm * perKmRate);

  const ride = await Ride.create({
    userId: req.user._id,
    driverId: nearestDriver ? nearestDriver._id : null,
    rideType,
    vehicleDetails: nearestDriver
      ? { model: nearestDriver.vehicleType, plateNumber: nearestDriver.vehicleNumber }
      : {},
    pickupLocation,
    dropLocation,
    distanceKm: Number(distanceKm.toFixed(2)),
    estimatedDuration: Math.round((distanceKm / 30) * 60), // assume avg 30km/h
    fare: { baseFare, perKmRate, surge: 1, totalFare },
    status: nearestDriver ? "accepted" : "requested"
  });

  if (nearestDriver) {
    await Driver.updateOne({ _id: nearestDriver._id }, { isAvailable: false });
  }

  return ApiResponse.success(res, {
    statusCode: 201,
    message: nearestDriver ? "Driver matched" : "Searching for nearby drivers",
    data: ride
  });
});

// PATCH /rides/:id/accept  (driver-side)
const acceptRide = asyncHandler(async (req, res) => {
  const { driverId } = req.body;
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw new ApiError(404, "Ride not found");
  if (ride.status !== "requested") throw new ApiError(400, "Ride already accepted or completed");

  ride.driverId = driverId;
  ride.status = "accepted";
  await ride.save();
  await Driver.updateOne({ _id: driverId }, { isAvailable: false });

  return ApiResponse.success(res, { message: "Ride accepted", data: ride });
});

// GET /rides/:id/track
const trackRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate("driverId", "name phone vehicleNumber currentLocation");
  if (!ride) throw new ApiError(404, "Ride not found");
  return ApiResponse.success(res, { message: "Ride status", data: ride });
});

// PATCH /rides/:id/complete
const completeRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw new ApiError(404, "Ride not found");

  ride.status = "completed";
  await ride.save();
  if (ride.driverId) await Driver.updateOne({ _id: ride.driverId }, { isAvailable: true });

  // Create a completed booking record for ride history / invoicing
  const booking = await Booking.create({
    bookingId: generateBookingId(),
    userId: ride.userId,
    travelType: ride.rideType,
    referenceId: ride._id,
    travelers: [],
    journeyDate: ride.createdAt,
    source: ride.pickupLocation.address,
    destination: ride.dropLocation.address,
    fare: { baseFare: ride.fare.baseFare, taxes: 0, discount: 0, totalFare: ride.fare.totalFare },
    status: "completed"
  });

  return ApiResponse.success(res, { message: "Ride completed", data: { ride, booking } });
});

// PATCH /rides/:id/cancel
const cancelRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({ _id: req.params.id, userId: req.user._id });
  if (!ride) throw new ApiError(404, "Ride not found");

  ride.status = "cancelled";
  await ride.save();
  if (ride.driverId) await Driver.updateOne({ _id: ride.driverId }, { isAvailable: true });

  return ApiResponse.success(res, { message: "Ride cancelled", data: ride });
});

module.exports = { requestRide, acceptRide, trackRide, completeRide, cancelRide };
