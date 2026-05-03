const Joi = require("joi");

const createPlanSchema = Joi.object({
  maLoaiCongViec: Joi.string().max(20).required().messages({
    "any.required": "Mã loại công việc là bắt buộc",
    "string.empty": "Mã loại công việc không được để trống"
  }),

  tieuDe: Joi.string().max(255).required().messages({
    "any.required": "Tiêu đề kế hoạch là bắt buộc",
    "string.empty": "Tiêu đề kế hoạch không được để trống"
  }),

  moTa: Joi.string().allow(null, ""),

  maTuyenDuong: Joi.string().max(20).required().messages({
    "any.required": "Mã tuyến đường là bắt buộc",
    "string.empty": "Mã tuyến đường không được để trống"
  }),

  maXaPhuong: Joi.string().max(20).required().messages({
    "any.required": "Mã xã phường là bắt buộc",
    "string.empty": "Mã xã phường không được để trống"
  }),

  nguoiLap: Joi.string().max(20).allow(null, "")
});

const updatePlanSchema = Joi.object({
  maLoaiCongViec: Joi.string().max(20),

  tieuDe: Joi.string().max(255),

  moTa: Joi.string().allow(null, ""),

  maTuyenDuong: Joi.string().max(20),

  maXaPhuong: Joi.string().max(20),

  nguoiCapNhat: Joi.string().max(20).allow(null, "")
}).min(1);

const cancelPlanSchema = Joi.object({
  lyDoHuy: Joi.string().max(1000).required().messages({
    "any.required": "Lý do hủy kế hoạch là bắt buộc",
    "string.empty": "Lý do hủy kế hoạch không được để trống"
  }),

  nguoiCapNhat: Joi.string().max(20).allow(null, "")
});

const updatePlanStatusSchema = Joi.object({
  trangThai: Joi.string()
    .valid("Đang chờ duyệt", "Đang chờ thẩm định", "Đã phê duyệt", "Đã bị từ chối")
    .required()
    .messages({
      "any.required": "Trạng thái kế hoạch là bắt buộc",
      "any.only": "Trạng thái kế hoạch không hợp lệ"
    }),

  yKienPheDuyet: Joi.string().max(2000).allow(null, ""),

  nguoiPheDuyet: Joi.string().max(20).allow(null, "")
});

module.exports = {
  createPlanSchema,
  updatePlanSchema,
  cancelPlanSchema,
  updatePlanStatusSchema
};