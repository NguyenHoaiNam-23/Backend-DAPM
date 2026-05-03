const express = require("express");

const acceptanceRecordController = require("./acceptanceRecord.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const {
  uploadAcceptanceRecordFiles
} = require("../../common/middlewares/upload.middleware");

const router = express.Router();

/**
 * Tạo hồ sơ lưu trữ nghiệm thu.
 *
 * POST /api/v1/acceptance-records
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - maLoaiCongViec
 * - tieuDe
 * - moTa
 * - nguoiTao
 * - maXaPhuong
 * - maTuyenDuong
 * - filePDF
 */
router.post(
  "/",
  uploadAcceptanceRecordFiles.single("filePDF"),
  asyncHandler(acceptanceRecordController.createAcceptanceRecord)
);

/**
 * Lấy danh sách hồ sơ nghiệm thu.
 *
 * GET /api/v1/acceptance-records
 */
router.get(
  "/",
  asyncHandler(acceptanceRecordController.getAcceptanceRecords)
);

/**
 * Xem chi tiết hồ sơ nghiệm thu.
 *
 * GET /api/v1/acceptance-records/:maHoSo
 */
router.get(
  "/:maHoSo",
  asyncHandler(acceptanceRecordController.getAcceptanceRecordById)
);

/**
 * Tải file hồ sơ nghiệm thu.
 *
 * GET /api/v1/acceptance-records/:maHoSo/download
 *
 * Lưu ý:
 * Route này cần đặt trước PUT/DELETE không bắt buộc, nhưng vẫn ổn vì method khác nhau.
 */
router.get(
  "/:maHoSo/download",
  asyncHandler(acceptanceRecordController.downloadAcceptanceRecord)
);

/**
 * Cập nhật hồ sơ nghiệm thu.
 *
 * PUT /api/v1/acceptance-records/:maHoSo
 */
router.put(
  "/:maHoSo",
  uploadAcceptanceRecordFiles.single("filePDF"),
  asyncHandler(acceptanceRecordController.updateAcceptanceRecord)
);

/**
 * Xóa hồ sơ nghiệm thu.
 *
 * DELETE /api/v1/acceptance-records/:maHoSo
 */
router.delete(
  "/:maHoSo",
  asyncHandler(acceptanceRecordController.deleteAcceptanceRecord)
);

module.exports = router;