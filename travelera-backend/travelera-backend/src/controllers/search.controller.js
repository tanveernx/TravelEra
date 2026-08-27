const Bus = require("../models/Bus");
const Car = require("../models/Car");
const Flight = require("../models/Flight");
const Train = require("../models/Train");
const Ferry = require("../models/Ferry");
const TempoTraveller = require("../models/TempoTraveller");
const Driver = require("../models/Driver");
const Route = require("../models/Route");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

function dayRange(dateStr) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
}

// GET /search/bus?from=&to=&date=
const searchBus = asyncHandler(async (req, res) => {
  const { from, to, date } = req.query;
  const routeQuery = {};
  if (from) routeQuery["source.city"] = new RegExp(`^${from}$`, "i");
  if (to) routeQuery["destination.city"] = new RegExp(`^${to}$`, "i");

  const routes = await Route.find(routeQuery).select("_id");
  const routeIds = routes.map((r) => r._id);

  const busQuery = { status: "scheduled" };
  if (routeIds.length) busQuery.routeId = { $in: routeIds };
  if (date) busQuery.departureTime = dayRange(date);

  const results = await Bus.find(busQuery).populate("operatorId", "name rating logo").populate("routeId");
  return ApiResponse.success(res, { message: "Buses fetched successfully", data: results });
});

// GET /search/car?city=&pickupDate=&dropDate=
const searchCar = asyncHandler(async (req, res) => {
  const { city, category } = req.query;
  const query = { isAvailable: true };
  if (city) query["currentLocation.city"] = new RegExp(`^${city}$`, "i");
  if (category) query.category = category;

  const results = await Car.find(query).populate("operatorId", "name rating logo");
  return ApiResponse.success(res, { message: "Cars fetched successfully", data: results });
});

// GET /search/flight?from=&to=&date=&class=
const searchFlight = asyncHandler(async (req, res) => {
  const { from, to, date, class: className } = req.query;
  const query = { status: "scheduled" };
  if (from) query["source.city"] = new RegExp(`^${from}$`, "i");
  if (to) query["destination.city"] = new RegExp(`^${to}$`, "i");
  if (date) query.departureTime = dayRange(date);
  if (className) query["classes.className"] = className;

  const results = await Flight.find(query).populate("operatorId", "name rating logo");
  return ApiResponse.success(res, { message: "Flights fetched successfully", data: results });
});

// GET /search/train?from=&to=&date=&class=
const searchTrain = asyncHandler(async (req, res) => {
  const { from, to, date, class: className } = req.query;
  const routeQuery = {};
  if (from) routeQuery["source.city"] = new RegExp(`^${from}$`, "i");
  if (to) routeQuery["destination.city"] = new RegExp(`^${to}$`, "i");

  const routes = await Route.find(routeQuery).select("_id");
  const routeIds = routes.map((r) => r._id);

  const query = { status: "scheduled" };
  if (routeIds.length) query.routeId = { $in: routeIds };
  if (date) query.departureTime = dayRange(date);
  if (className) query["classes.className"] = className;

  const results = await Train.find(query).populate("operatorId", "name rating logo").populate("routeId");
  return ApiResponse.success(res, { message: "Trains fetched successfully", data: results });
});

// GET /search/ferry?from=&to=&date=
const searchFerry = asyncHandler(async (req, res) => {
  const { from, to, date } = req.query;
  const routeQuery = {};
  if (from) routeQuery["source.city"] = new RegExp(`^${from}$`, "i");
  if (to) routeQuery["destination.city"] = new RegExp(`^${to}$`, "i");

  const routes = await Route.find(routeQuery).select("_id");
  const routeIds = routes.map((r) => r._id);

  const query = { status: "scheduled" };
  if (routeIds.length) query.routeId = { $in: routeIds };
  if (date) query.departureTime = dayRange(date);

  const results = await Ferry.find(query).populate("operatorId", "name rating logo").populate("routeId");
  return ApiResponse.success(res, { message: "Ferries fetched successfully", data: results });
});

// GET /search/tempo?city=&seats=
const searchTempo = asyncHandler(async (req, res) => {
  const { city, seats } = req.query;
  const query = { isAvailable: true };
  if (city) query["currentLocation.city"] = new RegExp(`^${city}$`, "i");
  if (seats) query.seatingCapacity = Number(seats);

  const results = await TempoTraveller.find(query).populate("operatorId", "name rating logo");
  return ApiResponse.success(res, { message: "Tempo Travellers fetched successfully", data: results });
});

// GET /search/ride?type=cab|bike&pickupLat=&pickupLng=
const searchRide = asyncHandler(async (req, res) => {
  const { type = "cab", pickupLat, pickupLng } = req.query;
  const query = { isAvailable: true, vehicleType: type };

  let driverQuery = Driver.find(query);
  if (pickupLat && pickupLng) {
    driverQuery = Driver.find({
      ...query,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(pickupLng), Number(pickupLat)] },
          $maxDistance: 8000 // 8km radius
        }
      }
    });
  }

  const drivers = await driverQuery.limit(10);
  return ApiResponse.success(res, { message: "Nearby drivers fetched", data: drivers });
});

module.exports = { searchBus, searchCar, searchFlight, searchTrain, searchFerry, searchTempo, searchRide };
