const reportService = require("./report.service");

/**
 * GET /api/v1/reports/trees/export
 */
const exportTreesReport = async (req, res) => {
  const result = await reportService.exportTreesReport(req.query);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);

  return res.send(result.buffer);
};

/**
 * GET /api/v1/reports/plans/export
 */
const exportPlansReport = async (req, res) => {
  const result = await reportService.exportPlansReport(req.query);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);

  return res.send(result.buffer);
};

/**
 * GET /api/v1/reports/incidents/export
 */
const exportIncidentsReport = async (req, res) => {
  const result = await reportService.exportIncidentsReport(req.query);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);

  return res.send(result.buffer);
};

/**
 * GET /api/v1/reports/acceptance/export
 */
const exportAcceptanceRecordsReport = async (req, res) => {
  const result = await reportService.exportAcceptanceRecordsReport(req.query);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);

  return res.send(result.buffer);
};

module.exports = {
  exportTreesReport,
  exportPlansReport,
  exportIncidentsReport,
  exportAcceptanceRecordsReport
};