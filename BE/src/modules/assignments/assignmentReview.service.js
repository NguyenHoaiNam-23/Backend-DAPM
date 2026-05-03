const assignmentRepository = require("./assignment.repository");
const assignmentDetailRepository = require("./assignmentDetail.repository");
const assignmentValidator = require("./assignment.validator");
const AppError = require("../../common/errors/AppError");

/**
 * PUT /api/v1/assignments/details/:maChiTiet/review
 */
const reviewTask = async ({ maChiTiet, body, currentUser }) => {
  const detail = await assignmentDetailRepository.findAssignmentDetailById(maChiTiet);

  if (!detail) {
    throw new AppError("Không tìm thấy chi tiết phân công", 404);
  }

  if (!detail.XacNhanHoanTat) {
    throw new AppError("Chỉ được nghiệm thu sau khi công nhân xác nhận hoàn tất", 409);
  }

  const { error, value } = assignmentValidator.reviewTaskSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu nghiệm thu chi tiết không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.ketQuaNghiemThuChiTiet === "Không đạt" && !value.lyDoYeuCauLamLai) {
    throw new AppError("Khi nghiệm thu không đạt phải nhập lý do yêu cầu làm lại", 400);
  }

  return assignmentDetailRepository.reviewTask(maChiTiet, {
    ketQuaNghiemThuChiTiet: value.ketQuaNghiemThuChiTiet,
    yeuCauDanhGia: value.yeuCauDanhGia || null,
    lyDoYeuCauLamLai: value.lyDoYeuCauLamLai || null,
    nguoiNghiemThu: currentUser?.maNguoiDung || value.nguoiNghiemThu || null
  });
};

/**
 * PUT /api/v1/assignments/:maKHPC/final-review
 */
const finalReviewAssignment = async ({ maKHPC, body, currentUser }) => {
  const assignment = await assignmentRepository.findAssignmentById(maKHPC);

  if (!assignment) {
    throw new AppError("Không tìm thấy kế hoạch phân công", 404);
  }

  const details = await assignmentDetailRepository.findDetailsByAssignmentId(maKHPC);

  if (details.length === 0) {
    throw new AppError("Kế hoạch phân công chưa có chi tiết công việc", 409);
  }

  const { error, value } = assignmentValidator.finalReviewAssignmentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu nghiệm thu toàn bộ kế hoạch phân công không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const hasUnfinishedTask = details.some((item) => !item.XacNhanHoanTat);

  if (value.trangThaiNghiemThu === "Đã nghiệm thu" && hasUnfinishedTask) {
    throw new AppError("Không thể nghiệm thu toàn bộ khi còn công việc chưa hoàn tất", 409);
  }

  const hasUnreviewedTask = details.some(
    (item) =>
      !item.KetQuaNghiemThuChiTiet ||
      item.KetQuaNghiemThuChiTiet === "Chưa nghiệm thu"
  );

  if (value.trangThaiNghiemThu === "Đã nghiệm thu" && hasUnreviewedTask) {
    throw new AppError("Không thể nghiệm thu toàn bộ khi còn công việc chưa được nghiệm thu chi tiết", 409);
  }

  const hasFailedTask = details.some((item) => item.KetQuaNghiemThuChiTiet === "Không đạt");

  if (value.trangThaiNghiemThu === "Đã nghiệm thu" && hasFailedTask) {
    throw new AppError("Không thể nghiệm thu toàn bộ khi còn công việc không đạt", 409);
  }

  return assignmentRepository.finalReviewAssignment(maKHPC, {
    trangThaiNghiemThu: value.trangThaiNghiemThu,
    yKienNghiemThu: value.yKienNghiemThu || null,
    nguoiNghiemThu: currentUser?.maNguoiDung || value.nguoiNghiemThu || null
  });
};

module.exports = {
  reviewTask,
  finalReviewAssignment
};