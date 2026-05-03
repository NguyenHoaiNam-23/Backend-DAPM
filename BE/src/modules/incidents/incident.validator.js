const Joi = require("joi");

const createIncidentSchema = Joi.object({
  maNguoiBaoCao: Joi.string().max(20).allow(null, ""),

  maXaPhuong: Joi.string().max(20).required().messages({
    "any.required": "Mã xã phường là bắt buộc",
    "string.empty": "Mã xã phường không được để trống"
  }),

  diaChiCuThe: Joi.string().max(500).required().messages({
    "any.required": "Địa chỉ cụ thể là bắt buộc",
    "string.empty": "Địa chỉ cụ thể không được để trống"
  }),

  loaiPhanAnh: Joi.string().max(100).required().messages({
    "any.required": "Loại phản ánh là bắt buộc",
    "string.empty": "Loại phản ánh không được để trống"
  }),

  noiDungPhanAnh: Joi.string().max(1000).allow(null, ""),

  chiTietBaoCao: Joi.string().required().messages({
    "any.required": "Chi tiết báo cáo là bắt buộc",
    "string.empty": "Chi tiết báo cáo không được để trống"
  })
});

const incidentDetailItemSchema = Joi.object({
  maCay: Joi.string().max(50).required().messages({
    "any.required": "Mã cây là bắt buộc trong chi tiết báo cáo",
    "string.empty": "Mã cây không được để trống"
  }),

  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),

  moTaTinhTrang: Joi.string().max(1000).allow(null, ""),

  mucDoNguyHiem: Joi.string()
    .valid("Thấp", "Trung bình", "Cao", "Khẩn cấp")
    .required()
    .messages({
      "any.required": "Mức độ nguy hiểm là bắt buộc",
      "any.only": "Mức độ nguy hiểm không hợp lệ"
    })
});

const updateStatusSchema = Joi.object({
  trangThaiXuLy: Joi.string()
    .valid("Đã tiếp nhận", "Đang xác minh", "Đang xử lý", "Hoàn thành", "Từ chối")
    .required()
    .messages({
      "any.required": "Trạng thái xử lý là bắt buộc",
      "any.only": "Trạng thái xử lý không hợp lệ"
    }),

  ghiChu: Joi.string().max(1000).allow(null, ""),

  maNguoiXuLy: Joi.string().max(20).allow(null, "")
});

const rejectIncidentSchema = Joi.object({
  lyDoTuChoi: Joi.string().max(1000).required().messages({
    "any.required": "Lý do từ chối là bắt buộc",
    "string.empty": "Lý do từ chối không được để trống"
  }),

  maNguoiXuLy: Joi.string().max(20).allow(null, "")
});

const replyIncidentSchema = Joi.object({
  traLoiPhanHoi: Joi.string().max(2000).required().messages({
    "any.required": "Nội dung phản hồi là bắt buộc",
    "string.empty": "Nội dung phản hồi không được để trống"
  }),

  maNguoiXuLy: Joi.string().max(20).allow(null, "")
});

module.exports = {
  createIncidentSchema,
  incidentDetailItemSchema,
  updateStatusSchema,
  rejectIncidentSchema,
  replyIncidentSchema
};