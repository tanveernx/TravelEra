const router = require("express").Router();
const ctrl = require("../controllers/ride.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/request", authenticate, ctrl.requestRide);
router.patch("/:id/accept", ctrl.acceptRide); // driver-side, driver auth omitted for brevity
router.get("/:id/track", authenticate, ctrl.trackRide);
router.patch("/:id/complete", ctrl.completeRide);
router.patch("/:id/cancel", authenticate, ctrl.cancelRide);

module.exports = router;
