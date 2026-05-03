const Joi = require("joi");

const createFieldReportSchema = Joi.object({
  maNguoiBaoCao: Joi.string().max(20).allow(null, ""),

  maXaPhuong: Joi.string().max(20).required(),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  diaChiCuThe: Joi.string().max(500).required(),

  noiDungBaoCao: Joi.string().max(1000).required(),

  chiTietBaoCao: Joi.string().required()
});

const fieldReportDetailSchema = Joi.object({
  maCay: Joi.string().max(50).required(),
  moTaTinhTrang: Joi.string().max(1000).allow(null, ""),
  mucDoNguyHiem: Joi.string()
    .valid("Thấp", "Trung bình", "Cao", "Khẩn cấp")
    .default("Thấp")
});

const updateFieldReportStatusSchema = Joi.object({
  trangThaiXuLy: Joi.string()
    .valid("Đã tiếp nhận", "Đang xác minh", "Đang xử lý", "Hoàn thành", "Từ chối")
    .required(),

  ghiChu: Joi.string().max(1000).allow(null, ""),
  maNguoiXuLy: Joi.string().max(20).allow(null, "")
});

module.exports = {
  createFieldReportSchema,
  fieldReportDetailSchema,
  updateFieldReportStatusSchema
};