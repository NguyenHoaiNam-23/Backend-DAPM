const planService = require("./plan.service");
const planStatusService = require("./planStatus.service");
const planApprovalHistoryRepository = require("./planApprovalHistory.repository");
const statisticsService = require("../statistics/statistics.service");
const reportService = require("../reports/report.service");


const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

const getPlanApprovalHistory = async (req, res) => {
  const result = await planApprovalHistoryRepository.findApprovalHistoryByPlanId(
    req.params.maKeHoach
  );

  return successResponse(res, result, "Lấy lịch sử trạng thái kế hoạch thành công");
};

/**
 * GET /api/v1/plans
 */
const getPlans = async (req, res) => {
  const result = await planService.getPlans(req.query);

  return successResponse(res, result, "Lấy danh sách kế hoạch thành công");
};

/**
 * GET /api/v1/plans/:maKeHoach
 */
const getPlanById = async (req, res) => {
  const result = await planService.getPlanById(req.params.maKeHoach);

  return successResponse(res, result, "Lấy chi tiết kế hoạch thành công");
};

/**
 * POST /api/v1/plans
 */
const createPlan = async (req, res) => {
  const result = await planService.createPlan({
    body: req.body,
    files: req.files || {},
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Tạo kế hoạch công việc thành công");
};

/**
 * PUT /api/v1/plans/:maKeHoach
 */
const updatePlan = async (req, res) => {
  const result = await planService.updatePlan({
    maKeHoach: req.params.maKeHoach,
    body: req.body,
    files: req.files || {},
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật kế hoạch công việc thành công");
};

/**
 * PUT /api/v1/plans/:maKeHoach/cancel
 */
const cancelPlan = async (req, res) => {
  const result = await planService.cancelPlan({
    maKeHoach: req.params.maKeHoach,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Hủy kế hoạch công việc thành công");
};

/**
 * PUT /api/v1/plans/:maKeHoach/status
 */
const updatePlanStatus = async (req, res) => {
  const result = await planStatusService.updatePlanStatus({
    maKeHoach: req.params.maKeHoach,
    body: req.body,
    file: req.file || null,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật trạng thái kế hoạch thành công");
};

const getPlanStatisticsAlias = async (req, res) => {
  const result = await statisticsService.getPlanStatistics(req.query);

  return successResponse(res, result, "Lấy thống kê kế hoạch thành công");
};

const exportPlanStatisticsAlias = async (req, res) => {
  const result = await reportService.exportPlansReport(req.query);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);

  return res.send(result.buffer);
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  cancelPlan,
  updatePlanStatus,
  getPlanApprovalHistory,
  getPlanStatisticsAlias,
  exportPlanStatisticsAlias
};