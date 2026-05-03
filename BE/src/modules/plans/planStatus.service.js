const planRepository = require("./plan.repository");
const planValidator = require("./plan.validator");
const AppError = require("../../common/errors/AppError");

const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

/**
 * State machine cho kế hoạch.
 *
 * Luồng hợp lệ:
 * Đang chờ duyệt -> Đang chờ thẩm định
 * Đang chờ duyệt -> Đã bị từ chối
 * Đang chờ thẩm định -> Đã duyệt
 * Đang chờ thẩm định -> Đã bị từ chối
 * Đã bị từ chối -> Đang chờ duyệt
 */
const PLAN_STATUS_TRANSITIONS = {
  "Đang chờ duyệt": ["Đang chờ thẩm định", "Đã bị từ chối"],
  "Đang chờ thẩm định": ["Đã phê duyệt", "Đã bị từ chối"],
  "Đã bị từ chối": ["Đang chờ duyệt"],
  "Đã phê duyệt": []
};

const validateStatusTransition = (currentStatus, nextStatus) => {
  const allowedNextStatuses = PLAN_STATUS_TRANSITIONS[currentStatus] || [];

  return allowedNextStatuses.includes(nextStatus);
};

/**
 * PUT /api/v1/plans/:maKeHoach/status
 */
const updatePlanStatus = async ({ maKeHoach, body, file, currentUser }) => {
  const existed = await planRepository.findPlanById(maKeHoach);

  if (!existed) {
    throw new AppError("Không tìm thấy kế hoạch công việc", 404);
  }

  const { error, value } = planValidator.updatePlanStatusSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật trạng thái kế hoạch không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const isValidTransition = validateStatusTransition(existed.TrangThai, value.trangThai);

  if (!isValidTransition) {
    throw new AppError(
      `Không thể chuyển trạng thái từ "${existed.TrangThai}" sang "${value.trangThai}"`,
      409
    );
  }

  const nguoiPheDuyet =
    currentUser?.maNguoiDung ||
    value.nguoiPheDuyet ||
    null;

  if (nguoiPheDuyet) {
    const user = await planRepository.findUserById(nguoiPheDuyet);

    if (!user) {
      throw new AppError("Mã người phê duyệt không tồn tại", 404);
    }
  }

  if (value.trangThai === "Đã bị từ chối" && !value.yKienPheDuyet) {
    throw new AppError("Khi từ chối kế hoạch phải nhập ý kiến/lý do từ chối", 400);
  }

  return planRepository.updatePlanStatus(maKeHoach, {
    trangThai: value.trangThai,
    yKienPheDuyet: value.yKienPheDuyet || null,
    filePDFBoSungKeHoach: buildFilePathForDb(file),
    nguoiPheDuyet
  });
};

module.exports = {
  updatePlanStatus,
  validateStatusTransition
};