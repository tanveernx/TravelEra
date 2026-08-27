const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/search", require("./search.routes"));
router.use("/bookings", require("./booking.routes"));
router.use("/rides", require("./ride.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/users", require("./user.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/admin", require("./admin.routes"));

router.get("/", (req, res) => {
  res.json({ success: true, message: "Travel Era API v1 — running" });
});

module.exports = router;
