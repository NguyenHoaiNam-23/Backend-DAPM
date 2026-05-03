const incidentService = require("./incident.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

/**
 * POST /api/v1/incidents
 */
const createIncident = async (req, res) => {
  const result = await incidentService.createIncident({
    body: req.body,
    files: req.files || [],
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Gửi phản ánh sự cố cây xanh thành công");
};

/**
 * GET /api/v1/incidents/my
 */
const getMyIncidents = async (req, res) => {
  const result = await incidentService.getMyIncidents({
    query: req.query,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Lấy danh sách phản ánh của tôi thành công");
};

/**
 * GET /api/v1/incidents
 */
const getIncidents = async (req, res) => {
  const result = await incidentService.getIncidents(req.query);

  return successResponse(res, result, "Lấy danh sách phản ánh sự cố thành công");
};

/**
 * GET /api/v1/incidents/:maBaoCao
 */
const getIncidentById = async (req, res) => {
  const result = await incidentService.getIncidentById(req.params.maBaoCao);

  return successResponse(res, result, "Lấy chi tiết phản ánh sự cố thành công");
};

/**
 * PUT /api/v1/incidents/:maBaoCao/status
 */
const updateIncidentStatus = async (req, res) => {
  const result = await incidentService.updateIncidentStatus({
    maBaoCao: req.params.maBaoCao,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật trạng thái phản ánh thành công");
};

/**
 * PUT /api/v1/incidents/:maBaoCao/reject
 */
const rejectIncident = async (req, res) => {
  const result = await incidentService.rejectIncident({
    maBaoCao: req.params.maBaoCao,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Từ chối phản ánh thành công");
};

/**
 * PUT /api/v1/incidents/:maBaoCao/reply
 */
const replyIncident = async (req, res) => {
  const result = await incidentService.replyIncident({
    maBaoCao: req.params.maBaoCao,
    body: req.body,
    file: req.file || null,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Phản hồi kết quả xử lý cho người dân thành công");
};

module.exports = {
  createIncident,
  getMyIncidents,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  rejectIncident,
  replyIncident
};