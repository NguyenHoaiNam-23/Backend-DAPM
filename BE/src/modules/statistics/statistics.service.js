const statisticsRepository = require("./statistics.repository");
const statisticsValidator = require("./statistics.validator");
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

/**
 * GET /api/v1/statistics/overview
 */
const getOverviewStatistics = async (query) => {
  const value = validateQuery(
    statisticsValidator.commonStatisticQuerySchema,
    query,
    "Tham số thống kê tổng quan không hợp lệ"
  );

  const [
    treeSummary,
    planSummary,
    incidentSummary,
    acceptanceSummary
  ] = await Promise.all([
    statisticsRepository.getTreeSummary(value),
    statisticsRepository.getPlanSummary(value),
    statisticsRepository.getIncidentSummary(value),
    statisticsRepository.getAcceptanceRecordSummary(value)
  ]);

  return {
    trees: treeSummary,
    plans: planSummary,
    incidents: incidentSummary,
    acceptanceRecords: acceptanceSummary
  };
};

/**
 * GET /api/v1/statistics/trees/by-area
 */
const getTreesByArea = async (query) => {
  const value = validateQuery(
    statisticsValidator.treeAreaQuerySchema,
    query,
    "Tham số thống kê cây theo khu vực không hợp lệ"
  );

  const [
    byWard,
    byStreet,
    byHealthStatus
  ] = await Promise.all([
    statisticsRepository.getTreesGroupedByWard(value),
    statisticsRepository.getTreesGroupedByStreet(value),
    statisticsRepository.getTreesGroupedByHealthStatus(value)
  ]);

  return {
    byWard,
    byStreet,
    byHealthStatus
  };
};

/**
 * GET /api/v1/statistics/trees/by-species
 */
const getTreesBySpecies = async (query) => {
  const value = validateQuery(
    statisticsValidator.treeSpeciesQuerySchema,
    query,
    "Tham số thống kê cây theo loài không hợp lệ"
  );

  const [
    bySpecies,
    bySpeciesAndHealth
  ] = await Promise.all([
    statisticsRepository.getTreesGroupedBySpecies(value),
    statisticsRepository.getTreesGroupedBySpeciesAndHealth(value)
  ]);

  return {
    bySpecies,
    bySpeciesAndHealth
  };
};

/**
 * GET /api/v1/statistics/trees/dangerous
 */
const getDangerousTreeStatistics = async (query) => {
  const value = validateQuery(
    statisticsValidator.dangerousTreeQuerySchema,
    query,
    "Tham số thống kê cây nguy hiểm không hợp lệ"
  );

  const [
    summary,
    byArea,
    byDangerLevel,
    latestReports
  ] = await Promise.all([
    statisticsRepository.getDangerousTreeSummary(value),
    statisticsRepository.getDangerousTreesByArea(value),
    statisticsRepository.getDangerousTreesByLevel(value),
    statisticsRepository.getLatestDangerousTreeReports(value)
  ]);

  return {
    summary,
    byArea,
    byDangerLevel,
    latestReports
  };
};

/**
 * GET /api/v1/statistics/plans
 */
const getPlanStatistics = async (query) => {
  const value = validateQuery(
    statisticsValidator.planStatisticQuerySchema,
    query,
    "Tham số thống kê kế hoạch không hợp lệ"
  );

  const [
    summary,
    byStatus,
    byWorkType,
    byArea,
    monthlyTrend
  ] = await Promise.all([
    statisticsRepository.getPlanSummary(value),
    statisticsRepository.getPlansGroupedByStatus(value),
    statisticsRepository.getPlansGroupedByWorkType(value),
    statisticsRepository.getPlansGroupedByArea(value),
    statisticsRepository.getPlansMonthlyTrend(value)
  ]);

  return {
    summary,
    byStatus,
    byWorkType,
    byArea,
    monthlyTrend
  };
};

/**
 * GET /api/v1/statistics/incidents
 */
const getIncidentStatistics = async (query) => {
  const value = validateQuery(
    statisticsValidator.incidentStatisticQuerySchema,
    query,
    "Tham số thống kê phản ánh không hợp lệ"
  );

  const [
    summary,
    byStatus,
    byType,
    byArea,
    byDangerLevel,
    monthlyTrend
  ] = await Promise.all([
    statisticsRepository.getIncidentSummary(value),
    statisticsRepository.getIncidentsGroupedByStatus(value),
    statisticsRepository.getIncidentsGroupedByType(value),
    statisticsRepository.getIncidentsGroupedByArea(value),
    statisticsRepository.getIncidentsGroupedByDangerLevel(value),
    statisticsRepository.getIncidentsMonthlyTrend(value)
  ]);

  return {
    summary,
    byStatus,
    byType,
    byArea,
    byDangerLevel,
    monthlyTrend
  };
};

module.exports = {
  getOverviewStatistics,
  getTreesByArea,
  getTreesBySpecies,
  getDangerousTreeStatistics,
  getPlanStatistics,
  getIncidentStatistics
};