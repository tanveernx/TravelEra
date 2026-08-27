const router = require("express").Router();
const ctrl = require("../controllers/search.controller");

router.get("/bus", ctrl.searchBus);
router.get("/car", ctrl.searchCar);
router.get("/flight", ctrl.searchFlight);
router.get("/train", ctrl.searchTrain);
router.get("/ferry", ctrl.searchFerry);
router.get("/tempo", ctrl.searchTempo);
router.get("/ride", ctrl.searchRide);

module.exports = router;
