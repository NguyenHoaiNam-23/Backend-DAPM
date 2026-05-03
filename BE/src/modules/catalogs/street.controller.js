const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");
const streetService = require("./street.service");

const getStreets = async (req, res) => {
  const result = await streetService.getStreets(req.query);
  return successResponse(res, result, "Lấy danh sách tuyến đường thành công");
};

const getStreetById = async (req, res) => {
  const result = await streetService.getStreetById(req.params.maTuyenDuong);
  return successResponse(res, result, "Lấy chi tiết tuyến đường thành công");
};

const createStreet = async (req, res) => {
  const result = await streetService.createStreet(req.body);
  return createdResponse(res, result, "Tạo tuyến đường thành công");
};

const updateStreet = async (req, res) => {
  const result = await streetService.updateStreet(req.params.maTuyenDuong, req.body);
  return successResponse(res, result, "Cập nhật tuyến đường thành công");
};

const deleteStreet = async (req, res) => {
  const result = await streetService.deleteStreet(req.params.maTuyenDuong);
  return successResponse(res, result, "Xóa tuyến đường thành công");
};

module.exports = {
  getStreets,
  getStreetById,
  createStreet,
  updateStreet,
  deleteStreet
};
