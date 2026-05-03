const userService = require("./user.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

const getUsers = async (req, res) => {
  const result = await userService.getUsers(req.query);

  return successResponse(res, result, "Lấy danh sách người dùng thành công");
};

const getUserById = async (req, res) => {
  const result = await userService.getUserById(req.params.maNguoiDung);

  return successResponse(res, result, "Lấy chi tiết người dùng thành công");
};

const createUser = async (req, res) => {
  const result = await userService.createUser(req.body);

  return createdResponse(res, result, "Tạo người dùng thành công");
};

const updateUser = async (req, res) => {
  const result = await userService.updateUser(req.params.maNguoiDung, req.body);

  return successResponse(res, result, "Cập nhật người dùng thành công");
};

const resetPassword = async (req, res) => {
  const result = await userService.resetPassword(req.params.maNguoiDung, req.body);

  return successResponse(res, result, "Đặt lại mật khẩu thành công");
};

const deleteUser = async (req, res) => {
  const result = await userService.deleteUser(req.params.maNguoiDung);

  return successResponse(res, result, "Khóa người dùng thành công");
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser
};