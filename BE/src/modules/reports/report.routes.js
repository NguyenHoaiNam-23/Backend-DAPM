const express = require("express");

const reportController = require("./report.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");

const router = express.Router();

/**
 * Xuất báo cáo cây xanh.
 *
 * GET /api/v1/reports/trees/export?format=excel
 * GET /api/v1/reports/trees/export?format=pdf
 *
 * Query:
 * - format: excel | pdf
 * - keyword
 * - maDMCay
 * - maTuyenDuong
 * - maXaPhuong
 * - trangThaiSucKhoe
 * - ngayTrongTu
 * - ngayTrongDen
 */
router.get(
  "/trees/export",
  asyncHandler(reportController.exportTreesReport)
);

/**
 * Xuất báo cáo kế hoạch.
 *
 * GET /api/v1/reports/plans/export?format=excel
 * GET /api/v1/reports/plans/export?format=pdf
 *
 * Query:
 * - format: excel | pdf
 * - keyword
 * - maLoaiCongViec
 * - trangThai
 * - maTuyenDuong
 * - maXaPhuong
 * - tuNgay
 * - denNgay
 */
router.get(
  "/plans/export",
  asyncHandler(reportController.exportPlansReport)
);

/**
 * Xuất báo cáo phản ánh sự cố.
 *
 * GET /api/v1/reports/incidents/export?format=excel
 * GET /api/v1/reports/incidents/export?format=pdf
 *
 * Query:
 * - format: excel | pdf
 * - keyword
 * - maXaPhuong
 * - trangThaiXuLy
 * - loaiPhanAnh
 * - tuNgay
 * - denNgay
 */
router.get(
  "/incidents/export",
  asyncHandler(reportController.exportIncidentsReport)
);

/**
 * Xuất báo cáo hồ sơ nghiệm thu.
 *
 * GET /api/v1/reports/acceptance/export?format=excel
 * GET /api/v1/reports/acceptance/export?format=pdf
 *
 * Query:
 * - format: excel | pdf
 * - keyword
 * - maLoaiCongViec
 * - maXaPhuong
 * - maTuyenDuong
 * - nguoiTao
 * - tuNgay
 * - denNgay
 */
router.get(
  "/acceptance/export",
  asyncHandler(reportController.exportAcceptanceRecordsReport)
);

module.exports = router;