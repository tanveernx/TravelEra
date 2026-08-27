const router = require("express").Router();
const ctrl = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/", authenticate, ctrl.createReview);
router.get("/operator/:id", ctrl.getOperatorReviews);

module.exports = router;
