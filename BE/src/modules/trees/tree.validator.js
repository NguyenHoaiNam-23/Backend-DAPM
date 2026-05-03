const Joi = require("joi");

const createTreeSchema = Joi.object({
  maDMCay: Joi.string().max(20).required().messages({
    "any.required": "Mã danh mục cây là bắt buộc",
    "string.empty": "Mã danh mục cây không được để trống"
  }),

  ngayTrong: Joi.date().allow(null, ""),

  nguonGoc: Joi.string().max(500).allow(null, ""),

  chieuCaoHienTai: Joi.number().min(0).required().messages({
    "any.required": "Chiều cao hiện tại là bắt buộc",
    "number.min": "Chiều cao hiện tại không được âm"
  }),

  duongKinhThanHienTai: Joi.number().min(0).required().messages({
    "any.required": "Đường kính thân hiện tại là bắt buộc",
    "number.min": "Đường kính thân hiện tại không được âm"
  }),

  duongKinhTanHienTai: Joi.number().min(0).allow(null),

  trangThaiSucKhoe: Joi.string().max(50).allow(null, ""),

  kinhDo: Joi.string().max(100).allow(null, ""),
  viDo: Joi.string().max(100).allow(null, ""),

  ghiChu: Joi.string().allow(null, ""),

  maTuyenDuong: Joi.string().max(20).required().messages({
    "any.required": "Mã tuyến đường là bắt buộc",
    "string.empty": "Mã tuyến đường không được để trống"
  }),

  maXaPhuong: Joi.string().max(20).required().messages({
    "any.required": "Mã xã phường là bắt buộc",
    "string.empty": "Mã xã phường không được để trống"
  }),

  maNguoiCapNhat: Joi.string().max(20).allow(null, "")
});

const updateTreeSchema = Joi.object({
  maDMCay: Joi.string().max(20),

  ngayTrong: Joi.date().allow(null, ""),

  nguonGoc: Joi.string().max(500).allow(null, ""),

  chieuCaoHienTai: Joi.number().min(0),
  duongKinhThanHienTai: Joi.number().min(0),
  duongKinhTanHienTai: Joi.number().min(0).allow(null),

  trangThaiSucKhoe: Joi.string().max(50).allow(null, ""),

  kinhDo: Joi.string().max(100).allow(null, ""),
  viDo: Joi.string().max(100).allow(null, ""),

  ghiChu: Joi.string().allow(null, ""),

  maTuyenDuong: Joi.string().max(20),
  maXaPhuong: Joi.string().max(20),

  maNguoiCapNhat: Joi.string().max(20).allow(null, "")
}).min(1);

const updateTreeLocationSchema = Joi.object({
  kinhDo: Joi.string().max(100).required().messages({
    "any.required": "Kinh độ là bắt buộc",
    "string.empty": "Kinh độ không được để trống"
  }),

  viDo: Joi.string().max(100).required().messages({
    "any.required": "Vĩ độ là bắt buộc",
    "string.empty": "Vĩ độ không được để trống"
  }),

  lyDoCapNhat: Joi.string().max(500).allow(null, ""),

  maNguoiCapNhat: Joi.string().max(20).allow(null, "")
});

const archiveTreeSchema = Joi.object({
  trangThaiSucKhoe: Joi.string()
    .valid("Đã chặt hạ", "Đã di dời", "Đã chết", "Ngưng quản lý", "Không còn tồn tại")
    .required()
    .messages({
      "any.required": "Trạng thái lưu trữ cây là bắt buộc",
      "any.only": "Trạng thái lưu trữ cây không hợp lệ"
    }),

  lyDo: Joi.string().max(500).allow(null, ""),

  maNguoiCapNhat: Joi.string().max(20).allow(null, "")
});

const createRiskAssessmentSchema = Joi.object({
  mucDoNguyHiem: Joi.string()
    .valid("Thấp", "Trung bình", "Cao", "Khẩn cấp")
    .required()
    .messages({
      "any.required": "Mức độ nguy hiểm là bắt buộc",
      "any.only": "Mức độ nguy hiểm không hợp lệ"
    }),

  moTaDanhGia: Joi.string().max(500).required().messages({
    "any.required": "Mô tả đánh giá là bắt buộc",
    "string.empty": "Mô tả đánh giá không được để trống"
  }),

  deXuatXuLy: Joi.string()
    .valid("Theo dõi", "Chăm sóc", "Cắt tỉa", "Chặt hạ", "Di chuyển", "Trồng thay thế")
    .required()
    .messages({
      "any.required": "Đề xuất xử lý là bắt buộc",
      "any.only": "Đề xuất xử lý không hợp lệ"
    }),

  maBaoCao: Joi.string().max(20).allow(null, ""),

  maNguoiCapNhat: Joi.string().max(20).allow(null, "")
});

module.exports = {
  createTreeSchema,
  updateTreeSchema,
  updateTreeLocationSchema,
  archiveTreeSchema,
  createRiskAssessmentSchema
};