const User = require("../models/User");
const Operator = require("../models/Operator");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Driver = require("../models/Driver");
const Route = require("../models/Route");
const Bus = require("../models/Bus");
const Car = require("../models/Car");
const Flight = require("../models/Flight");
const Train = require("../models/Train");
const Ferry = require("../models/Ferry");
const TempoTraveller = require("../models/TempoTraveller");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const inventoryModelMap = {
  bus: Bus,
  car: Car,
  flight: Flight,
  train: Train,
  ferry: Ferry,
  tempo: TempoTraveller
};

// GET /admin/dashboard
const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalOperators, totalBookings, confirmedBookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Operator.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "confirmed" }),
    Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);

  const bookingsByType = await Booking.aggregate([{ $group: { _id: "$travelType", count: { $sum: 1 } } }]);

  return ApiResponse.success(res, {
    message: "Dashboard analytics",
    data: {
      totalUsers,
      totalOperators,
      totalBookings,
      confirmedBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      bookingsByType
    }
  });
});

// GET /admin/operators
const listOperators = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  const operators = await Operator.find(query).sort({ createdAt: -1 });
  return ApiResponse.success(res, { message: "Operators fetched", data: operators });
});

// POST /admin/operators
const createOperator = asyncHandler(async (req, res) => {
  const operator = await Operator.create(req.body);
  return ApiResponse.success(res, { statusCode: 201, message: "Operator created", data: operator });
});

// PATCH /admin/operators/:id
const updateOperator = asyncHandler(async (req, res) => {
  const operator = await Operator.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!operator) throw new ApiError(404, "Operator not found");
  return ApiResponse.success(res, { message: "Operator updated", data: operator });
});

// DELETE /admin/operators/:id
const deleteOperator = asyncHandler(async (req, res) => {
  await Operator.findByIdAndDelete(req.params.id);
  return ApiResponse.success(res, { message: "Operator deleted" });
});

// GET /admin/bookings
const listAllBookings = asyncHandler(async (req, res) => {
  const { status, travelType, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (travelType) query.travelType = travelType;

  const bookings = await Booking.find(query)
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Booking.countDocuments(query);

  return ApiResponse.success(res, {
    message: "All bookings fetched",
    data: bookings,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

// PATCH /admin/bookings/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!booking) throw new ApiError(404, "Booking not found");
  return ApiResponse.success(res, { message: "Booking status updated", data: booking });
});

// GET /admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = role ? { role } : {};
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);
  return ApiResponse.success(res, {
    message: "Users fetched",
    data: users,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

// PATCH /admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "operator", "admin"].includes(role)) throw new ApiError(400, "Invalid role");
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  return ApiResponse.success(res, { message: "User role updated", data: user });
});

// GET /admin/routes
const listRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find().populate("operatorId", "name type");
  return ApiResponse.success(res, { message: "Routes fetched", data: routes });
});

// POST /admin/routes
const createRoute = asyncHandler(async (req, res) => {
  const route = await Route.create(req.body);
  return ApiResponse.success(res, { statusCode: 201, message: "Route created", data: route });
});

// Generic inventory add: POST /admin/:type  (type = bus|car|flight|train|ferry|tempo)
const addInventory = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const Model = inventoryModelMap[type];
  if (!Model) throw new ApiError(400, "Invalid inventory type");

  const item = await Model.create(req.body);
  return ApiResponse.success(res, { statusCode: 201, message: `${type} added successfully`, data: item });
});

// Generic inventory list: GET /admin/:type
const listInventory = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const Model = inventoryModelMap[type];
  if (!Model) throw new ApiError(400, "Invalid inventory type");

  const items = await Model.find().populate("operatorId", "name type");
  return ApiResponse.success(res, { message: `${type} list fetched`, data: items });
});

// Generic inventory update: PATCH /admin/:type/:id
const updateInventory = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const Model = inventoryModelMap[type];
  if (!Model) throw new ApiError(400, "Invalid inventory type");

  const item = await Model.findByIdAndUpdate(id, req.body, { new: true });
  if (!item) throw new ApiError(404, `${type} not found`);
  return ApiResponse.success(res, { message: `${type} updated`, data: item });
});

// Generic inventory delete: DELETE /admin/:type/:id
const deleteInventory = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const Model = inventoryModelMap[type];
  if (!Model) throw new ApiError(400, "Invalid inventory type");

  await Model.findByIdAndDelete(id);
  return ApiResponse.success(res, { message: `${type} deleted` });
});

// GET /admin/drivers
const listDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find().sort({ createdAt: -1 });
  return ApiResponse.success(res, { message: "Drivers fetched", data: drivers });
});

// POST /admin/drivers
const createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  return ApiResponse.success(res, { statusCode: 201, message: "Driver added", data: driver });
});

// PATCH /admin/drivers/:id
const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!driver) throw new ApiError(404, "Driver not found");
  return ApiResponse.success(res, { message: "Driver updated", data: driver });
});

module.exports = {
  dashboard,
  listOperators,
  createOperator,
  updateOperator,
  deleteOperator,
  listAllBookings,
  updateBookingStatus,
  listUsers,
  updateUserRole,
  listRoutes,
  createRoute,
  addInventory,
  listInventory,
  updateInventory,
  deleteInventory,
  listDrivers,
  createDriver,
  updateDriver
};
