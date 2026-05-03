const express = require("express");

const adminController = require("./admin.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { authenticate, authorize } = require("../../common/middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN", "QUAN_LY"),
  asyncHandler(adminController.getDashboard)
);

module.exports = router;