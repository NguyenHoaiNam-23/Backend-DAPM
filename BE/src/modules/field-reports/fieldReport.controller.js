const fieldReportService = require("./fieldReport.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

const createFieldReport = async (req, res) => {
  const result = await fieldReportService.createFieldReport({
    body: req.body,
    files: req.files || [],
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Tạo báo cáo hiện trường thành công");
};

const getFieldReports = async (req, res) => {
  const result = await fieldReportService.getFieldReports(req.query);

  return successResponse(res, result, "Lấy danh sách báo cáo hiện trường thành công");
};

const updateFieldReportStatus = async (req, res) => {
  const result = await fieldReportService.updateFieldReportStatus({
    maBaoCao: req.params.maBaoCao,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật trạng thái báo cáo hiện trường thành công");
};

module.exports = {
  createFieldReport,
  getFieldReports,
  updateFieldReportStatus
};