const reportRepository = require("./report.repository");
const reportValidator = require("./report.validator");
const excelReportService = require("./excelReport.service");
const pdfReportService = require("./pdfReport.service");
const AppError = require("../../common/errors/AppError");

const validateQuery = (schema, query, errorMessage) => {
  const { error, value } = schema.validate(query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      errorMessage,
      400,
      error.details.map((item) => item.message)
    );
  }

  return value;
};

const ensureDataExists = (rows, reportName) => {
  if (!rows || rows.length === 0) {
    throw new AppError(`Không có dữ liệu để xuất ${reportName}`, 404);
  }
};

/**
 * GET /api/v1/reports/trees/export
 */
const exportTreesReport = async (query) => {
  const value = validateQuery(
    reportValidator.treesReportQuerySchema,
    query,
    "Tham số xuất báo cáo cây xanh không hợp lệ"
  );

  const rows = await reportRepository.getTreesForReport(value);

  ensureDataExists(rows, "báo cáo cây xanh");

  if (value.format === "pdf") {
    return pdfReportService.buildTreesPdfReport(rows);
  }

  return excelReportService.buildTreesExcelReport(rows);
};

/**
 * GET /api/v1/reports/plans/export
 */
const exportPlansReport = async (query) => {
  const value = validateQuery(
    reportValidator.plansReportQuerySchema,
    query,
    "Tham số xuất báo cáo kế hoạch không hợp lệ"
  );

  const rows = await reportRepository.getPlansForReport(value);

  ensureDataExists(rows, "báo cáo kế hoạch");

  if (value.format === "pdf") {
    return pdfReportService.buildPlansPdfReport(rows);
  }

  return excelReportService.buildPlansExcelReport(rows);
};

/**
 * GET /api/v1/reports/incidents/export
 */
const exportIncidentsReport = async (query) => {
  const value = validateQuery(
    reportValidator.incidentsReportQuerySchema,
    query,
    "Tham số xuất báo cáo phản ánh"
  );

  const rows = await reportRepository.getIncidentsForReport(value);

  ensureDataExists(rows, "báo cáo phản ánh");

  if (value.format === "pdf") {
    return pdfReportService.buildIncidentsPdfReport(rows);
  }

  return excelReportService.buildIncidentsExcelReport(rows);
};

/**
 * GET /api/v1/reports/acceptance/export
 */
const exportAcceptanceRecordsReport = async (query) => {
  const value = validateQuery(
    reportValidator.acceptanceRecordsReportQuerySchema,
    query,
    "Tham số xuất báo cáo hồ sơ nghiệm thu không hợp lệ"
  );

  const rows = await reportRepository.getAcceptanceRecordsForReport(value);

  ensureDataExists(rows, "báo cáo hồ sơ nghiệm thu");

  if (value.format === "pdf") {
    return pdfReportService.buildAcceptanceRecordsPdfReport(rows);
  }

  return excelReportService.buildAcceptanceRecordsExcelReport(rows);
};

module.exports = {
  exportTreesReport,
  exportPlansReport,
  exportIncidentsReport,
  exportAcceptanceRecordsReport
};