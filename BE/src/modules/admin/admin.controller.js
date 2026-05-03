const adminService = require("./admin.service");
const {
  successResponse
} = require("../../common/responses/baseResponse");

const getDashboard = async (req, res) => {
  const result = await adminService.getDashboard();

  return successResponse(res, result, "Lấy dashboard quản trị thành công");
};

module.exports = {
  getDashboard
};