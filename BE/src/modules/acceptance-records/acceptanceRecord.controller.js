const acceptanceRecordService = require("./acceptanceRecord.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

/**
 * POST /api/v1/acceptance-records
 */
const createAcceptanceRecord = async (req, res) => {
  const result = await acceptanceRecordService.createAcceptanceRecord({
    body: req.body,
    file: req.file || null,
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Tạo hồ sơ nghiệm thu thành công");
};

/**
 * GET /api/v1/acceptance-records
 */
const getAcceptanceRecords = async (req, res) => {
  const result = await acceptanceRecordService.getAcceptanceRecords(req.query);

  return successResponse(res, result, "Lấy danh sách hồ sơ nghiệm thu thành công");
};

/**
 * GET /api/v1/acceptance-records/:maHoSo
 */
const getAcceptanceRecordById = async (req, res) => {
  const result = await acceptanceRecordService.getAcceptanceRecordById(req.params.maHoSo);

  return successResponse(res, result, "Lấy chi tiết hồ sơ nghiệm thu thành công");
};

/**
 * GET /api/v1/acceptance-records/:maHoSo/download
 */
const downloadAcceptanceRecord = async (req, res) => {
  const result = await acceptanceRecordService.getAcceptanceRecordFile(req.params.maHoSo);

  return res.download(result.filePath, result.fileName);
};

/**
 * PUT /api/v1/acceptance-records/:maHoSo
 */
const updateAcceptanceRecord = async (req, res) => {
  const result = await acceptanceRecordService.updateAcceptanceRecord({
    maHoSo: req.params.maHoSo,
    body: req.body,
    file: req.file || null,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật hồ sơ nghiệm thu thành công");
};

/**
 * DELETE /api/v1/acceptance-records/:maHoSo
 */
const deleteAcceptanceRecord = async (req, res) => {
  const result = await acceptanceRecordService.deleteAcceptanceRecord(req.params.maHoSo);

  return successResponse(res, result, "Xóa hồ sơ nghiệm thu thành công");
};

module.exports = {
  createAcceptanceRecord,
  getAcceptanceRecords,
  getAcceptanceRecordById,
  downloadAcceptanceRecord,
  updateAcceptanceRecord,
  deleteAcceptanceRecord
};