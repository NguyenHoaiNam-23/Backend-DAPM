const Joi = require("joi");

const commonStatisticQuerySchema = Joi.object({
  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, ""),

  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, "")
});

const treeAreaQuerySchema = Joi.object({
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, "")
});

const treeSpeciesQuerySchema = Joi.object({
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, "")
});

const dangerousTreeQuerySchema = Joi.object({
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),

  mucDoNguyHiem: Joi.string()
    .valid("Thấp", "Trung bình", "Cao", "Khẩn cấp")
    .allow(null, "")
});

const planStatisticQuerySchema = Joi.object({
  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, ""),

  maLoaiCongViec: Joi.string().max(20).allow(null, ""),
  trangThai: Joi.string()
    .valid("Đang chờ duyệt", "Đang chờ thẩm định", "Đã duyệt", "Đã bị từ chối")
    .allow(null, ""),

  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, "")
});

const incidentStatisticQuerySchema = Joi.object({
  tuNgay: Joi.date().allow(null, ""),
  denNgay: Joi.date().allow(null, ""),

  maXaPhuong: Joi.string().max(20).allow(null, ""),

  trangThaiXuLy: Joi.string()
    .valid("Đã tiếp nhận", "Đang xác minh", "Đang xử lý", "Hoàn thành", "Từ chối")
    .allow(null, ""),

  loaiPhanAnh: Joi.string().max(100).allow(null, "")
});

module.exports = {
  commonStatisticQuerySchema,
  treeAreaQuerySchema,
  treeSpeciesQuerySchema,
  dangerousTreeQuerySchema,
  planStatisticQuerySchema,
  incidentStatisticQuerySchema
};