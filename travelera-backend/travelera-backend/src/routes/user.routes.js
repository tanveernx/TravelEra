const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/profile", ctrl.getProfile);
router.patch("/profile", ctrl.updateProfile);
router.post("/avatar", ctrl.updateAvatar);
router.post("/saved-travelers", ctrl.addSavedTraveler);
router.delete("/saved-travelers/:id", ctrl.removeSavedTraveler);

module.exports = router;
