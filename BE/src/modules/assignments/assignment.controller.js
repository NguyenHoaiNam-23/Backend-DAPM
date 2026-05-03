const assignmentService = require("./assignment.service");
const assignmentReviewService = require("./assignmentReview.service");

const {
  successResponse,
  createdResponse
} = require("../../common/responses/baseResponse");

/**
 * POST /api/v1/assignments
 */
const createAssignment = async (req, res) => {
  const result = await assignmentService.createAssignment({
    body: req.body,
    file: req.file || null,
    currentUser: req.user || null
  });

  return createdResponse(res, result, "Tạo kế hoạch phân công thành công");
};

/**
 * GET /api/v1/assignments
 */
const getAssignments = async (req, res) => {
  const result = await assignmentService.getAssignments(req.query);

  return successResponse(res, result, "Lấy danh sách phân công thành công");
};

/**
 * GET /api/v1/assignments/:maKHPC
 */
const getAssignmentById = async (req, res) => {
  const result = await assignmentService.getAssignmentById(req.params.maKHPC);

  return successResponse(res, result, "Lấy chi tiết phân công thành công");
};

/**
 * GET /api/v1/assignments/my-tasks
 */
const getMyTasks = async (req, res) => {
  const result = await assignmentService.getMyTasks({
    query: req.query,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Lấy danh sách công việc được giao thành công");
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/accept
 */
const acceptTask = async (req, res) => {
  const result = await assignmentService.acceptTask({
    maChiTiet: req.params.maChiTiet,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Xác nhận nhận việc thành công");
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/execute
 */
const executeTask = async (req, res) => {
  const result = await assignmentService.executeTask({
    maChiTiet: req.params.maChiTiet,
    body: req.body,
    files: req.files || {},
    currentUser: req.user || null
  });

  return successResponse(res, result, "Cập nhật kết quả thực hiện công việc thành công");
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/review
 */
const reviewTask = async (req, res) => {
  const result = await assignmentReviewService.reviewTask({
    maChiTiet: req.params.maChiTiet,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Nghiệm thu chi tiết công việc thành công");
};

/**
 * GET /api/v1/assignments/rework-tasks
 */
const getReworkTasks = async (req, res) => {
  const result = await assignmentService.getReworkTasks({
    query: req.query,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Lấy danh sách công việc cần làm lại thành công");
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/rework
 */
const reworkTask = async (req, res) => {
  const result = await assignmentService.reworkTask({
    maChiTiet: req.params.maChiTiet,
    body: req.body,
    files: req.files || {},
    currentUser: req.user || null
  });

  return successResponse(res, result, "Gửi lại kết quả làm lại thành công");
};

/**
 * PUT /api/v1/assignments/:maKHPC/final-review
 */
const finalReviewAssignment = async (req, res) => {
  const result = await assignmentReviewService.finalReviewAssignment({
    maKHPC: req.params.maKHPC,
    body: req.body,
    currentUser: req.user || null
  });

  return successResponse(res, result, "Nghiệm thu toàn bộ kế hoạch phân công thành công");
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMyTasks,
  acceptTask,
  executeTask,
  reviewTask,
  getReworkTasks,
  reworkTask,
  finalReviewAssignment
};