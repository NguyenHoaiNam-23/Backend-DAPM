const express = require("express");

const fieldReportController = require("./fieldReport.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { uploadIncidentImages } = require("../../common/middlewares/upload.middleware");
const { authenticate } = require("../../common/middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadIncidentImages.array("hinhAnh", 10),
  asyncHandler(fieldReportController.createFieldReport)
);

router.get(
  "/",
  authenticate,
  asyncHandler(fieldReportController.getFieldReports)
);

router.put(
  "/:maBaoCao/status",
  authenticate,
  asyncHandler(fieldReportController.updateFieldReportStatus)
);

module.exports = router;