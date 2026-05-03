const Joi = require("joi");

const exportFormatSchema = Joi.string()
  .valid("excel", "pdf")
  .default("excel");

const treesReportQuerySchema = Joi.object({
  format: exportFormatSchema,

  keyword: Joi.string().allow(null, ""),
  maDMCay: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  trangThaiSucKhoe: Joi.string().max(50).allow(null, ""),

  ngayTrongTu: Joi.date().allow(null, ""),
  ngayTrongDen: Joi.date().allow(null, "")
});

const plansReportQuerySchema = Joi.object({
  format: exportFormatSchema,

  keyword: Joi.string().allow(null, ""),
  maLoaiCongViec: Joi.string().max(20).allow(null, ""),
  trangThai: Joi.string()
    .valid("Đang chờ duyệt", "Đang chờ thẩm định", "Đã duyệt", "Đã bị từ chối")
    .allow(null, ""),

  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),

  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, "")
});

const incidentsReportQuerySchema = Joi.object({
  format: exportFormatSchema,

  keyword: Joi.string().allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),

  trangThaiXuLy: Joi.string()
    .valid("Đã tiếp nhận", "Đang xác minh", "Đang xử lý", "Hoàn thành", "Từ chối")
    .allow(null, ""),

  loaiPhanAnh: Joi.string().max(100).allow(null, ""),

  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, "")
});

const acceptanceRecordsReportQuerySchema = Joi.object({
  format: exportFormatSchema,

  keyword: Joi.string().allow(null, ""),
  maLoaiCongViec: Joi.string().max(20).allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  nguoiTao: Joi.string().max(20).allow(null, ""),

  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, "")
});

module.exports = {
  treesReportQuerySchema,
  plansReportQuerySchema,
  incidentsReportQuerySchema,
  acceptanceRecordsReportQuerySchema
};