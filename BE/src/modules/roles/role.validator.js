const Joi = require("joi");

const createRoleSchema = Joi.object({
  maVaiTro: Joi.string().max(20).required().messages({
    "any.required": "Mã vai trò là bắt buộc",
    "string.empty": "Mã vai trò không được để trống"
  }),

  tenVaiTro: Joi.string().max(100).required().messages({
    "any.required": "Tên vai trò là bắt buộc",
    "string.empty": "Tên vai trò không được để trống"
  })
});

const updateRoleSchema = Joi.object({
  tenVaiTro: Joi.string().max(100).required().messages({
    "any.required": "Tên vai trò là bắt buộc",
    "string.empty": "Tên vai trò không được để trống"
  })
});

module.exports = {
  createRoleSchema,
  updateRoleSchema
};