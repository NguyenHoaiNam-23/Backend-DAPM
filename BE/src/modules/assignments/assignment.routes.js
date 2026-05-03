const express = require("express");

const assignmentController = require("./assignment.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { uploadAssignmentFiles } = require("../../common/middlewares/upload.middleware");

const router = express.Router();

/**
 * Tạo kế hoạch phân công.
 *
 * POST /api/v1/assignments
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - maKHCV
 * - tieuDe
 * - nguoiTao
 * - filePDF
 * - danhSachCongNhan: JSON string
 */
router.post(
  "/",
  uploadAssignmentFiles.single("filePDF"),
  asyncHandler(assignmentController.createAssignment)
);

/**
 * Lấy danh sách kế hoạch phân công.
 *
 * GET /api/v1/assignments
 */
router.get(
  "/",
  asyncHandler(assignmentController.getAssignments)
);

/**
 * Công nhân xem danh sách việc được giao.
 *
 * GET /api/v1/assignments/my-tasks?maCongNhan=U010
 *
 * Lưu ý:
 * Route này phải đặt trước /:maKHPC.
 */
router.get(
  "/my-tasks",
  asyncHandler(assignmentController.getMyTasks)
);

router.get(
  "/history",
  asyncHandler(assignmentController.getMyTasks)
);

/**
 * Công nhân xem danh sách việc bị yêu cầu làm lại.
 *
 * GET /api/v1/assignments/rework-tasks?maCongNhan=U010
 *
 * Lưu ý:
 * Route này phải đặt trước /:maKHPC.
 */
router.get(
  "/rework-tasks",
  asyncHandler(assignmentController.getReworkTasks)
);

/**
 * Xem chi tiết kế hoạch phân công.
 *
 * GET /api/v1/assignments/:maKHPC
 */
router.get(
  "/:maKHPC",
  asyncHandler(assignmentController.getAssignmentById)
);

/**
 * Công nhân xác nhận nhận việc.
 *
 * PUT /api/v1/assignments/details/:maChiTiet/accept
 */
router.put(
  "/details/:maChiTiet/accept",
  asyncHandler(assignmentController.acceptTask)
);

/**
 * Công nhân cập nhật kết quả thực hiện.
 *
 * PUT /api/v1/assignments/details/:maChiTiet/execute
 *
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - xacNhanHoanTat
 * - khoiLuongHoanThanh
 * - lyDo
 * - anhTruoc[]
 * - anhSau[]
 */
router.put(
  "/details/:maChiTiet/execute",
  uploadAssignmentFiles.fields([
    { name: "anhTruoc", maxCount: 10 },
    { name: "anhSau", maxCount: 10 }
  ]),
  asyncHandler(assignmentController.executeTask)
);

/**
 * Nhân viên kỹ thuật nghiệm thu chi tiết phân công.
 *
 * PUT /api/v1/assignments/details/:maChiTiet/review
 */
router.put(
  "/details/:maChiTiet/review",
  asyncHandler(assignmentController.reviewTask)
);

/**
 * Công nhân gửi lại kết quả làm lại.
 *
 * PUT /api/v1/assignments/details/:maChiTiet/rework
 */
router.put(
  "/details/:maChiTiet/rework",
  uploadAssignmentFiles.fields([
    { name: "anhTruoc", maxCount: 10 },
    { name: "anhSau", maxCount: 10 }
  ]),
  asyncHandler(assignmentController.reworkTask)
);

/**
 * Nghiệm thu toàn bộ kế hoạch phân công.
 *
 * PUT /api/v1/assignments/:maKHPC/final-review
 */
router.put(
  "/:maKHPC/final-review",
  asyncHandler(assignmentController.finalReviewAssignment)
);

module.exports = router;