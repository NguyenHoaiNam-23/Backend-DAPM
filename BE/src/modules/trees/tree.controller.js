const treeService = require("./tree.service");
const treeMapService = require("./treeMap.service");
const treeRiskService = require("./treeRisk.service");
const treeImportService = require("./treeImport.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

/**
 * GET /api/v1/trees
 */
const getTrees = async (req, res) => {
  const result = await treeService.getTrees(req.query);

  return successResponse(res, result, "Lấy danh sách cây xanh thành công");
};

/**
 * GET /api/v1/trees/:maCay
 */
const getTreeById = async (req, res) => {
  const result = await treeService.getTreeById(req.params.maCay);

  return successResponse(res, result, "Lấy chi tiết cây xanh thành công");
};

/**
 * POST /api/v1/trees
 */
const createTree = async (req, res) => {
  const result = await treeService.createTree({
    body: req.body,
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Tạo hồ sơ cây xanh thành công");
};

/**
 * PUT /api/v1/trees/:maCay
 */
const updateTree = async (req, res) => {
  const result = await treeService.updateTree({
    maCay: req.params.maCay,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật hồ sơ cây xanh thành công");
};

/**
 * PUT /api/v1/trees/:maCay/location
 */
const updateTreeLocation = async (req, res) => {
  const result = await treeService.updateTreeLocation({
    maCay: req.params.maCay,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật vị trí cây xanh thành công");
};

/**
 * PUT /api/v1/trees/:maCay/archive
 */
const archiveTree = async (req, res) => {
  const result = await treeService.archiveTree({
    maCay: req.params.maCay,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật trạng thái lưu trữ cây xanh thành công");
};

/**
 * GET /api/v1/trees/map
 */
const getTreesForMap = async (req, res) => {
  const result = await treeMapService.getTreesForMap(req.query);

  return successResponse(res, result, "Lấy dữ liệu cây xanh trên bản đồ thành công");
};

/**
 * GET /api/v1/trees/dangerous
 */
const getDangerousTrees = async (req, res) => {
  const result = await treeRiskService.getDangerousTrees(req.query);

  return successResponse(res, result, "Lấy danh sách cây nguy hiểm thành công");
};

/**
 * POST /api/v1/trees/:maCay/risk-assessments
 */
const createRiskAssessment = async (req, res) => {
  const result = await treeRiskService.createRiskAssessment({
    maCay: req.params.maCay,
    body: req.body,
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Đánh giá mức độ nguy hiểm của cây thành công");
};

/**
 * GET /api/v1/trees/:maCay/work-history
 */
const getTreeWorkHistory = async (req, res) => {
  const result = await treeService.getTreeWorkHistory(req.params.maCay);

  return successResponse(res, result, "Lấy lịch sử công việc của cây thành công");
};

/**
 * POST /api/v1/trees/import
 */
const importTreesFromExcel = async (req, res) => {
  const result = await treeImportService.importTreesFromExcel({
    file: req.file,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Import danh sách cây xanh từ Excel hoàn tất");
};

module.exports = {
  getTrees,
  getTreeById,
  createTree,
  updateTree,
  updateTreeLocation,
  archiveTree,
  getTreesForMap,
  getDangerousTrees,
  createRiskAssessment,
  getTreeWorkHistory,
  importTreesFromExcel
};