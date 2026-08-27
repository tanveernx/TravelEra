const router = require("express").Router();
const ctrl = require("../controllers/booking.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.post("/bus", ctrl.createBusBooking);
router.post("/car", ctrl.createCarBooking);
router.post("/flight", ctrl.createFlightBooking);
router.post("/train", ctrl.createTrainBooking);
router.post("/ferry", ctrl.createFerryBooking);
router.post("/tempo", ctrl.createTempoBooking);

router.get("/", ctrl.listMyBookings);
router.get("/:id", ctrl.getBooking);
router.patch("/:id/cancel", ctrl.cancelBooking);
router.get("/:id/ticket", ctrl.downloadTicket);

module.exports = router;
