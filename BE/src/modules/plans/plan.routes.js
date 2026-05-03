const express = require("express");

const planController = require("./plan.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");

const {
  uploadPlanFiles,
  uploadPlanApprovalFiles
} = require("../../common/middlewares/upload.middleware");

const router = express.Router();

/**
 * Lấy danh sách kế hoạch.
 *
 * GET /api/v1/plans
 */
router.get(
  "/",
  asyncHandler(planController.getPlans)
);
router.get(
  "/statistics",
  asyncHandler(planController.getPlanStatisticsAlias)
);

router.get(
  "/statistics/export",
  asyncHandler(planController.exportPlanStatisticsAlias)
);
/**
 * Xem chi tiết kế hoạch.
 *
 * GET /api/v1/plans/:maKeHoach
 */
router.get(
  "/:maKeHoach",
  asyncHandler(planController.getPlanById)
);

router.get(
  "/:maKeHoach/approval-history",
  asyncHandler(planController.getPlanApprovalHistory)
);

/**
 * Tạo mới kế hoạch.
 *
 * POST /api/v1/plans
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - maLoaiCongViec
 * - tieuDe
 * - moTa
 * - maTuyenDuong
 * - maXaPhuong
 * - nguoiLap
 * - filePDFKeHoach
 * - filePDFDeNghiCapPhep
 */
router.post(
  "/",
  uploadPlanFiles.fields([
    { name: "filePDFKeHoach", maxCount: 1 },
    { name: "filePDFDeNghiCapPhep", maxCount: 1 }
  ]),
  asyncHandler(planController.createPlan)
);

/**
 * Cập nhật kế hoạch khi chưa duyệt hoặc đã bị từ chối.
 *
 * PUT /api/v1/plans/:maKeHoach
 */
router.put(
  "/:maKeHoach",
  uploadPlanFiles.fields([
    { name: "filePDFKeHoach", maxCount: 1 },
    { name: "filePDFDeNghiCapPhep", maxCount: 1 }
  ]),
  asyncHandler(planController.updatePlan)
);

/**
 * Hủy kế hoạch khi chưa duyệt.
 *
 * PUT /api/v1/plans/:maKeHoach/cancel
 */
router.put(
  "/:maKeHoach/cancel",
  asyncHandler(planController.cancelPlan)
);

/**
 * Cập nhật trạng thái/phê duyệt kế hoạch.
 *
 * PUT /api/v1/plans/:maKeHoach/status
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - trangThai
 * - yKienPheDuyet
 * - nguoiPheDuyet
 * - filePDFBoSungKeHoach
 */
router.put(
  "/:maKeHoach/status",
  uploadPlanApprovalFiles.single("filePDFBoSungKeHoach"),
  asyncHandler(planController.updatePlanStatus)
);

module.exports = router;