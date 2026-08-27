const router = require("express").Router();
const ctrl = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate, authorize("admin"));

router.get("/dashboard", ctrl.dashboard);

router.get("/operators", ctrl.listOperators);
router.post("/operators", ctrl.createOperator);
router.patch("/operators/:id", ctrl.updateOperator);
router.delete("/operators/:id", ctrl.deleteOperator);

router.get("/routes", ctrl.listRoutes);
router.post("/routes", ctrl.createRoute);

router.get("/bookings", ctrl.listAllBookings);
router.patch("/bookings/:id/status", ctrl.updateBookingStatus);

router.get("/users", ctrl.listUsers);
router.patch("/users/:id/role", ctrl.updateUserRole);

router.get("/drivers", ctrl.listDrivers);
router.post("/drivers", ctrl.createDriver);
router.patch("/drivers/:id", ctrl.updateDriver);

// Generic inventory CRUD for all 6 scheduled travel modes: bus, car, flight, train, ferry, tempo
router.get("/:type", ctrl.listInventory);
router.post("/:type", ctrl.addInventory);
router.patch("/:type/:id", ctrl.updateInventory);
router.delete("/:type/:id", ctrl.deleteInventory);

module.exports = router;
