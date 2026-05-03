const express = require("express");

const statisticsController = require("./statistics.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");

const router = express.Router();

router.get(
  "/overview",
  asyncHandler(statisticsController.getOverviewStatistics)
);

router.get(
  "/trees/by-area",
  asyncHandler(statisticsController.getTreesByArea)
);

router.get(
  "/trees/by-species",
  asyncHandler(statisticsController.getTreesBySpecies)
);

router.get(
  "/trees/dangerous",
  asyncHandler(statisticsController.getDangerousTreeStatistics)
);

router.get(
  "/plans",
  asyncHandler(statisticsController.getPlanStatistics)
);

router.get(
  "/incidents",
  asyncHandler(statisticsController.getIncidentStatistics)
);

module.exports = router;