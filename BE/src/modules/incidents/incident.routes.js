const express = require("express");
const incidentController = require("./incident.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const {
  uploadIncidentImages,
  uploadIncidentReply
} = require("../../common/middlewares/upload.middleware");

const router = express.Router();

/**
 * Người dân gửi báo cáo sự cố.
 *
 * POST /api/v1/incidents
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - maNguoiBaoCao
 * - maXaPhuong
 * - diaChiCuThe
 * - loaiPhanAnh
 * - noiDungPhanAnh
 * - chiTietBaoCao: JSON string
 * - hinhAnh[]: files
 */
router.post(
  "/",
  uploadIncidentImages.array("hinhAnh", 10),
  asyncHandler(incidentController.createIncident)
);

/**
 * Người dân xem phản ánh của mình.
 *
 * GET /api/v1/incidents/my?maNguoiBaoCao=U001
 */
router.get(
  "/my",
  asyncHandler(incidentController.getMyIncidents)
);

/**
 * Nhân viên kỹ thuật / quản lý xem danh sách phản ánh.
 *
 * GET /api/v1/incidents
 */
router.get(
  "/",
  asyncHandler(incidentController.getIncidents)
);

/**
 * Xem chi tiết phản ánh.
 *
 * GET /api/v1/incidents/:maBaoCao
 */
router.get(
  "/:maBaoCao",
  asyncHandler(incidentController.getIncidentById)
);

/**
 * Cập nhật trạng thái phản ánh.
 *
 * PUT /api/v1/incidents/:maBaoCao/status
 */
router.put(
  "/:maBaoCao/status",
  asyncHandler(incidentController.updateIncidentStatus)
);

/**
 * Từ chối phản ánh.
 *
 * PUT /api/v1/incidents/:maBaoCao/reject
 */
router.put(
  "/:maBaoCao/reject",
  asyncHandler(incidentController.rejectIncident)
);

/**
 * Phản hồi kết quả xử lý cho người dân.
 *
 * PUT /api/v1/incidents/:maBaoCao/reply
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - traLoiPhanHoi
 * - pdfDinhKemXuLy: file PDF hoặc ảnh minh chứng
 */
router.put(
  "/:maBaoCao/reply",
  uploadIncidentReply.single("pdfDinhKemXuLy"),
  asyncHandler(incidentController.replyIncident)
);

module.exports = router;