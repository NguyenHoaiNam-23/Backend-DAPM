const planRepository = require("./plan.repository");
const planValidator = require("./plan.validator");
const AppError = require("../../common/errors/AppError");

/**
 * Chuẩn hóa đường dẫn file lưu DB.
 */
const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

/**
 * Lấy file đầu tiên từ req.files[fieldName].
 */
const getUploadedFile = (files, fieldName) => {
  if (!files || !files[fieldName] || files[fieldName].length === 0) {
    return null;
  }

  return files[fieldName][0];
};

/**
 * GET /api/v1/plans
 */
const getPlans = async (query) => {
  return planRepository.findPlans(query);
};

/**
 * GET /api/v1/plans/:maKeHoach
 */
const getPlanById = async (maKeHoach) => {
  const plan = await planRepository.findPlanById(maKeHoach);

  if (!plan) {
    throw new AppError("Không tìm thấy kế hoạch công việc", 404);
  }

  return plan;
};

/**
 * POST /api/v1/plans
 */
const createPlan = async ({ body, files, currentUser }) => {
  const { error, value } = planValidator.createPlanSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu kế hoạch không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const workType = await planRepository.findWorkTypeById(value.maLoaiCongViec);

  if (!workType) {
    throw new AppError("Mã loại công việc không tồn tại", 404);
  }

  const ward = await planRepository.findWardById(value.maXaPhuong);

  if (!ward) {
    throw new AppError("Mã xã phường không tồn tại", 404);
  }

  const street = await planRepository.findStreetById(value.maTuyenDuong);

  if (!street) {
    throw new AppError("Mã tuyến đường không tồn tại", 404);
  }

  if (street.MaXaPhuong !== value.maXaPhuong) {
    throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
  }

  const nguoiLap =
    currentUser?.maNguoiDung ||
    value.nguoiLap ||
    null;

  if (nguoiLap) {
    const user = await planRepository.findUserById(nguoiLap);

    if (!user) {
      throw new AppError("Mã người lập kế hoạch không tồn tại", 404);
    }
  }

  const filePDFKeHoach = getUploadedFile(files, "filePDFKeHoach");
  const filePDFDeNghiCapPhep = getUploadedFile(files, "filePDFDeNghiCapPhep");

  const maKeHoach = await planRepository.generatePlanId();

  return planRepository.createPlan({
    maKeHoach,
    maLoaiCongViec: value.maLoaiCongViec,
    tieuDe: value.tieuDe,
    moTa: value.moTa || null,
    maTuyenDuong: value.maTuyenDuong,
    maXaPhuong: value.maXaPhuong,
    nguoiLap,
    trangThai: "Đang chờ duyệt",
    filePDFKeHoach: buildFilePathForDb(filePDFKeHoach),
    filePDFDeNghiCapPhep: buildFilePathForDb(filePDFDeNghiCapPhep)
  });
};

/**
 * PUT /api/v1/plans/:maKeHoach
 */
const updatePlan = async ({ maKeHoach, body, files, currentUser }) => {
  const existed = await planRepository.findPlanById(maKeHoach);

  if (!existed) {
    throw new AppError("Không tìm thấy kế hoạch công việc", 404);
  }

  const editableStatuses = ["Đang chờ duyệt", "Đã bị từ chối"];

  if (!editableStatuses.includes(existed.TrangThai)) {
    throw new AppError("Chỉ được cập nhật kế hoạch khi đang chờ duyệt hoặc đã bị từ chối", 409);
  }

  const { error, value } = planValidator.updatePlanSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật kế hoạch không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.maLoaiCongViec) {
    const workType = await planRepository.findWorkTypeById(value.maLoaiCongViec);

    if (!workType) {
      throw new AppError("Mã loại công việc không tồn tại", 404);
    }
  }

  if (value.maXaPhuong) {
    const ward = await planRepository.findWardById(value.maXaPhuong);

    if (!ward) {
      throw new AppError("Mã xã phường không tồn tại", 404);
    }
  }

  if (value.maTuyenDuong) {
    const street = await planRepository.findStreetById(value.maTuyenDuong);

    if (!street) {
      throw new AppError("Mã tuyến đường không tồn tại", 404);
    }

    const targetWard = value.maXaPhuong || existed.MaXaPhuong;

    if (street.MaXaPhuong !== targetWard) {
      throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
    }
  }

  const filePDFKeHoach = getUploadedFile(files, "filePDFKeHoach");
  const filePDFDeNghiCapPhep = getUploadedFile(files, "filePDFDeNghiCapPhep");

  return planRepository.updatePlan(maKeHoach, {
    ...value,
    filePDFKeHoach: buildFilePathForDb(filePDFKeHoach),
    filePDFDeNghiCapPhep: buildFilePathForDb(filePDFDeNghiCapPhep)
  });
};

/**
 * PUT /api/v1/plans/:maKeHoach/cancel
 */
const cancelPlan = async ({ maKeHoach, body, currentUser }) => {
  const existed = await planRepository.findPlanById(maKeHoach);

  if (!existed) {
    throw new AppError("Không tìm thấy kế hoạch công việc", 404);
  }

  const cancelableStatuses = ["Đang chờ duyệt", "Đang chờ thẩm định"];

  if (!cancelableStatuses.includes(existed.TrangThai)) {
    throw new AppError("Chỉ được hủy kế hoạch khi chưa được duyệt", 409);
  }

  const { error, value } = planValidator.cancelPlanSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu hủy kế hoạch không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return planRepository.cancelPlan(maKeHoach, {
    lyDoHuy: value.lyDoHuy,
    nguoiCapNhat: currentUser?.maNguoiDung || value.nguoiCapNhat || null
  });
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  cancelPlan
};