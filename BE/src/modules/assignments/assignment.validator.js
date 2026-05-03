const Joi = require("joi");

const createAssignmentSchema = Joi.object({
  maKHCV: Joi.string().max(20).required().messages({
    "any.required": "Mã kế hoạch công việc là bắt buộc",
    "string.empty": "Mã kế hoạch công việc không được để trống"
  }),

  tieuDe: Joi.string().max(255).required().messages({
    "any.required": "Tiêu đề phân công là bắt buộc",
    "string.empty": "Tiêu đề phân công không được để trống"
  }),

  nguoiTao: Joi.string().max(20).allow(null, ""),

  danhSachCongNhan: Joi.string().required().messages({
    "any.required": "Danh sách công nhân là bắt buộc",
    "string.empty": "Danh sách công nhân không được để trống"
  })
});

const workerAssignmentItemSchema = Joi.object({
  maCongNhan: Joi.string().max(20).required().messages({
    "any.required": "Mã công nhân là bắt buộc",
    "string.empty": "Mã công nhân không được để trống"
  }),

  congViecCuThe: Joi.string().max(1000).required().messages({
    "any.required": "Công việc cụ thể là bắt buộc",
    "string.empty": "Công việc cụ thể không được để trống"
  }),

  thoiGianBatDau: Joi.date().required().messages({
    "any.required": "Thời gian bắt đầu là bắt buộc"
  }),

  thoiGianKetThuc: Joi.date().required().messages({
    "any.required": "Thời gian kết thúc là bắt buộc"
  }),

  yeuCauDanhGia: Joi.string().max(1000).allow(null, "")
});

const acceptTaskSchema = Joi.object({
  xacNhanNhanViec: Joi.boolean().truthy("true").falsy("false").required().messages({
    "any.required": "Xác nhận nhận việc là bắt buộc"
  }),

  maCongNhan: Joi.string().max(20).allow(null, "")
});

const executeTaskSchema = Joi.object({
  xacNhanHoanTat: Joi.boolean().truthy("true").falsy("false").required().messages({
    "any.required": "Xác nhận hoàn tất là bắt buộc"
  }),

  khoiLuongHoanThanh: Joi.string().max(1000).allow(null, ""),

  lyDo: Joi.string().max(1000).allow(null, ""),

  maCongNhan: Joi.string().max(20).allow(null, "")
});

const reviewTaskSchema = Joi.object({
  ketQuaNghiemThuChiTiet: Joi.string()
    .valid("Đạt", "Không đạt")
    .required()
    .messages({
      "any.required": "Kết quả nghiệm thu chi tiết là bắt buộc",
      "any.only": "Kết quả nghiệm thu chi tiết không hợp lệ"
    }),

  yeuCauDanhGia: Joi.string().max(1000).allow(null, ""),

  lyDoYeuCauLamLai: Joi.string().max(1000).allow(null, ""),

  nguoiNghiemThu: Joi.string().max(20).allow(null, "")
});

const reworkTaskSchema = Joi.object({
  khoiLuongHoanThanh: Joi.string().max(1000).allow(null, ""),

  ghiChuLamLai: Joi.string().max(1000).allow(null, ""),

  maCongNhan: Joi.string().max(20).allow(null, "")
});

const finalReviewAssignmentSchema = Joi.object({
  trangThaiNghiemThu: Joi.string()
    .valid("Đã nghiệm thu", "Chưa đạt", "Yêu cầu bổ sung")
    .required()
    .messages({
      "any.required": "Trạng thái nghiệm thu là bắt buộc",
      "any.only": "Trạng thái nghiệm thu không hợp lệ"
    }),

  yKienNghiemThu: Joi.string().max(2000).allow(null, ""),

  nguoiNghiemThu: Joi.string().max(20).allow(null, "")
});

module.exports = {
  createAssignmentSchema,
  workerAssignmentItemSchema,
  acceptTaskSchema,
  executeTaskSchema,
  reviewTaskSchema,
  reworkTaskSchema,
  finalReviewAssignmentSchema
};