const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");
const wardService = require("./ward.service");

const getWards = async (req, res) => {
  const result = await wardService.getWards(req.query);
  return successResponse(res, result, "Lấy danh sách xã phường thành công");
};

const getWardById = async (req, res) => {
  const result = await wardService.getWardById(req.params.maXaPhuong);
  return successResponse(res, result, "Lấy chi tiết xã phường thành công");
};

const createWard = async (req, res) => {
  const result = await wardService.createWard(req.body);
  return createdResponse(res, result, "Tạo xã phường thành công");
};

const updateWard = async (req, res) => {
  const result = await wardService.updateWard(req.params.maXaPhuong, req.body);
  return successResponse(res, result, "Cập nhật xã phường thành công");
};

const deleteWard = async (req, res) => {
  const result = await wardService.deleteWard(req.params.maXaPhuong);
  return successResponse(res, result, "Xóa xã phường thành công");
};

module.exports = {
  getWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard
};
