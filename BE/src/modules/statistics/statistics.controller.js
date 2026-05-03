const statisticsService = require("./statistics.service");

const {
  successResponse
} = require("../../common/responses/baseResponse");

const getOverviewStatistics = async (req, res) => {
  const result = await statisticsService.getOverviewStatistics(req.query);

  return successResponse(res, result, "Lấy thống kê tổng quan thành công");
};

const getTreesByArea = async (req, res) => {
  const result = await statisticsService.getTreesByArea(req.query);

  return successResponse(res, result, "Lấy thống kê cây xanh theo khu vực thành công");
};

const getTreesBySpecies = async (req, res) => {
  const result = await statisticsService.getTreesBySpecies(req.query);

  return successResponse(res, result, "Lấy thống kê cây xanh theo loài thành công");
};

const getDangerousTreeStatistics = async (req, res) => {
  const result = await statisticsService.getDangerousTreeStatistics(req.query);

  return successResponse(res, result, "Lấy thống kê cây nguy hiểm thành công");
};

const getPlanStatistics = async (req, res) => {
  const result = await statisticsService.getPlanStatistics(req.query);

  return successResponse(res, result, "Lấy thống kê kế hoạch thành công");
};

const getIncidentStatistics = async (req, res) => {
  const result = await statisticsService.getIncidentStatistics(req.query);

  return successResponse(res, result, "Lấy thống kê phản ánh thành công");
};

module.exports = {
  getOverviewStatistics,
  getTreesByArea,
  getTreesBySpecies,
  getDangerousTreeStatistics,
  getPlanStatistics,
  getIncidentStatistics
};