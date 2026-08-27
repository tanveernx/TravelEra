const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.post("/create-order", authenticate, ctrl.createOrder);
router.post("/verify", authenticate, ctrl.verifyPayment);
router.post("/webhook", ctrl.webhook); // signed by gateway, no user JWT
router.post("/:id/refund", authenticate, authorize("admin"), ctrl.refund);

module.exports = router;
