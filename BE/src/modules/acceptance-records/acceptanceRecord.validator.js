const Joi = require("joi");

const createAcceptanceRecordSchema = Joi.object({
  maLoaiCongViec: Joi.string().max(20).required().messages({
    "any.required": "Mã loại công việc là bắt buộc",
    "string.empty": "Mã loại công việc không được để trống"
  }),

  tieuDe: Joi.string().max(150).required().messages({
    "any.required": "Tiêu đề hồ sơ là bắt buộc",
    "string.empty": "Tiêu đề hồ sơ không được để trống"
  }),

  moTa: Joi.string().max(500).allow(null, ""),

  nguoiTao: Joi.string().max(20).allow(null, ""),

  maXaPhuong: Joi.string().max(20).required().messages({
    "any.required": "Mã xã phường là bắt buộc",
    "string.empty": "Mã xã phường không được để trống"
  }),

  maTuyenDuong: Joi.string().max(20).required().messages({
    "any.required": "Mã tuyến đường là bắt buộc",
    "string.empty": "Mã tuyến đường không được để trống"
  })
});

const updateAcceptanceRecordSchema = Joi.object({
  maLoaiCongViec: Joi.string().max(20),

  tieuDe: Joi.string().max(150),

  moTa: Joi.string().max(500).allow(null, ""),

  nguoiCapNhat: Joi.string().max(20).allow(null, ""),

  maXaPhuong: Joi.string().max(20),

  maTuyenDuong: Joi.string().max(20)
}).min(1);

module.exports = {
  createAcceptanceRecordSchema,
  updateAcceptanceRecordSchema
};