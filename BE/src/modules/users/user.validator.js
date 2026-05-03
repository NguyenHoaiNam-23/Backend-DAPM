const Joi = require("joi");

const createUserSchema = Joi.object({
  tenDangNhap: Joi.string().max(17).required(),
  hoTen: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  sdt: Joi.string().max(10).allow(null, ""),
  matKhau: Joi.string().min(6).required(),

  maVaiTro: Joi.string()
    .valid("ADMIN", "CANBO", "NVKT", "CONGNAN")
    .required(),

  trangThai: Joi.string().valid("Hoạt động", "Khóa").default("Hoạt động"),

  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  diaChi: Joi.string().max(100).allow(null, "")
});

const updateUserSchema = Joi.object({
  tenDangNhap: Joi.string().max(17),
  hoTen: Joi.string().max(50),
  email: Joi.string().email(),
  sdt: Joi.string().max(10).allow(null, ""),

  maVaiTro: Joi.string()
    .valid("ADMIN", "CANBO", "NVKT", "CONGNAN"),

  trangThai: Joi.string().valid("Hoạt động", "Khóa"),

  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  diaChi: Joi.string().max(100).allow(null, "")
}).min(1);

const resetPasswordSchema = Joi.object({
  matKhauMoi: Joi.string().min(6).required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema
};