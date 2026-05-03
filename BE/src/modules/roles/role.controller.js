const roleService = require("./role.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

const getRoles = async (req, res) => {
  const result = await roleService.getRoles();

  return successResponse(res, result, "Lấy danh sách vai trò thành công");
};

const getRoleById = async (req, res) => {
  const result = await roleService.getRoleById(req.params.maVaiTro);

  return successResponse(res, result, "Lấy chi tiết vai trò thành công");
};

const createRole = async (req, res) => {
  const result = await roleService.createRole(req.body);

  return createdResponse(res, result, "Tạo vai trò thành công");
};

const updateRole = async (req, res) => {
  const result = await roleService.updateRole(req.params.maVaiTro, req.body);

  return successResponse(res, result, "Cập nhật vai trò thành công");
};

const deleteRole = async (req, res) => {
  const result = await roleService.deleteRole(req.params.maVaiTro);

  return successResponse(res, result, "Xóa vai trò thành công");
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};