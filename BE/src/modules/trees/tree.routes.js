const express = require("express");
const treeController = require("./tree.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { uploadExcel } = require("../../common/middlewares/upload.middleware");

const router = express.Router();

/**
 * Lấy danh sách cây xanh có phân trang, tìm kiếm, lọc
 * GET /api/v1/trees
 */
router.get(
  "/",
  asyncHandler(treeController.getTrees)
);

/**
 * Lấy danh sách cây để hiển thị trên bản đồ
 * GET /api/v1/trees/map
 */
router.get(
  "/map",
  asyncHandler(treeController.getTreesForMap)
);

/**
 * Lấy danh sách cây nguy hiểm
 * GET /api/v1/trees/dangerous
 */
router.get(
  "/dangerous",
  asyncHandler(treeController.getDangerousTrees)
);

/**
 * Import danh sách cây từ Excel
 * POST /api/v1/trees/import
 *
 * Content-Type: multipart/form-data
 * Field:
 * - file: Excel .xlsx
 * - maTuyenDuong
 * - maXaPhuong
 * - maNguoiCapNhat
 */
router.post(
  "/import",
  uploadExcel.single("file"),
  asyncHandler(treeController.importTreesFromExcel)
);

/**
 * Xem chi tiết một cây
 * GET /api/v1/trees/:maCay
 */
router.get(
  "/:maCay",
  asyncHandler(treeController.getTreeById)
);

/**
 * Tạo mới một cây đơn lẻ
 * POST /api/v1/trees
 */
router.post(
  "/",
  asyncHandler(treeController.createTree)
);

/**
 * Cập nhật hồ sơ cây
 * PUT /api/v1/trees/:maCay
 */
router.put(
  "/:maCay",
  asyncHandler(treeController.updateTree)
);

/**
 * Cập nhật vị trí cây trên bản đồ
 * PUT /api/v1/trees/:maCay/location
 */
router.put(
  "/:maCay/location",
  asyncHandler(treeController.updateTreeLocation)
);

router.patch(
  "/:maCay/location",
  asyncHandler(treeController.updateTreeLocation)
);

/**
 * Xóa mềm / lưu trữ cây khỏi bản đồ
 * PUT /api/v1/trees/:maCay/archive
 */
router.put(
  "/:maCay/archive",
  asyncHandler(treeController.archiveTree)
);

/**
 * Lập đánh giá cây nguy hiểm
 * POST /api/v1/trees/:maCay/risk-assessments
 */
router.post(
  "/:maCay/risk-assessments",
  asyncHandler(treeController.createRiskAssessment)
);

/**
 * Xem lịch sử công việc / phản ánh liên quan đến cây
 * GET /api/v1/trees/:maCay/work-history
 */
router.get(
  "/:maCay/work-history",
  asyncHandler(treeController.getTreeWorkHistory)
);

module.exports = router;