const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");
const workTypeService = require("./workType.service");

const getWorkTypes = async (req, res) => {
  const result = await workTypeService.getWorkTypes(req.query);
  return successResponse(res, result, "Lấy danh sách loại công việc thành công");
};

const getWorkTypeById = async (req, res) => {
  const result = await workTypeService.getWorkTypeById(req.params.maLoaiCongViec);
  return successResponse(res, result, "Lấy chi tiết loại công việc thành công");
};

const createWorkType = async (req, res) => {
  const result = await workTypeService.createWorkType(req.body);
  return createdResponse(res, result, "Tạo loại công việc thành công");
};

const updateWorkType = async (req, res) => {
  const result = await workTypeService.updateWorkType(req.params.maLoaiCongViec, req.body);
  return successResponse(res, result, "Cập nhật loại công việc thành công");
};

const deleteWorkType = async (req, res) => {
  const result = await workTypeService.deleteWorkType(req.params.maLoaiCongViec);
  return successResponse(res, result, "Xóa loại công việc thành công");
};

module.exports = {
  getWorkTypes,
  getWorkTypeById,
  createWorkType,
  updateWorkType,
  deleteWorkType
};
