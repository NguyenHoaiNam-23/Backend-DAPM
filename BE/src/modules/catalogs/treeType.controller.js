const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");
const treeTypeService = require("./treeType.service");

const getTreeTypes = async (req, res) => {
  const result = await treeTypeService.getTreeTypes(req.query);
  return successResponse(res, result, "Lấy danh sách danh mục cây trồng thành công");
};

const getTreeTypeById = async (req, res) => {
  const result = await treeTypeService.getTreeTypeById(req.params.maDMCay);
  return successResponse(res, result, "Lấy chi tiết danh mục cây trồng thành công");
};

const createTreeType = async (req, res) => {
  const result = await treeTypeService.createTreeType(req.body);
  return createdResponse(res, result, "Tạo danh mục cây trồng thành công");
};

const updateTreeType = async (req, res) => {
  const result = await treeTypeService.updateTreeType(req.params.maDMCay, req.body);
  return successResponse(res, result, "Cập nhật danh mục cây trồng thành công");
};

const deleteTreeType = async (req, res) => {
  const result = await treeTypeService.deleteTreeType(req.params.maDMCay);
  return successResponse(res, result, "Xóa danh mục cây trồng thành công");
};

module.exports = {
  getTreeTypes,
  getTreeTypeById,
  createTreeType,
  updateTreeType,
  deleteTreeType
};
