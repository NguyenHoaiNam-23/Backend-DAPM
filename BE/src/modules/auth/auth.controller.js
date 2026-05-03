const authService = require("./auth.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

const login = async (req, res) => {
  const result = await authService.login(req.body);

  return successResponse(res, result, "Đăng nhập thành công");
};

const register = async (req, res) => {
  const result = await authService.register(req.body);

  return createdResponse(res, result, "Đăng ký tài khoản thành công");
};

const getProfile = async (req, res) => {
  const result = await authService.getProfile(req.user);

  return successResponse(res, result, "Lấy thông tin tài khoản thành công");
};

const updateProfile = async (req, res) => {
  const result = await authService.updateProfile({
    body: req.body,
    currentUser: req.user
  });

  return successResponse(res, result, "Cập nhật thông tin tài khoản thành công");
};

const changePassword = async (req, res) => {
  const result = await authService.changePassword({
    body: req.body,
    currentUser: req.user
  });

  return successResponse(res, result, "Đổi mật khẩu thành công");
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword
};