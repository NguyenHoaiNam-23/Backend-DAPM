const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email là bắt buộc",
    "string.email": "Email không hợp lệ",
    "string.empty": "Email không được để trống"
  }),

  matKhau: Joi.string().required().messages({
    "any.required": "Mật khẩu là bắt buộc",
    "string.empty": "Mật khẩu không được để trống"
  })
});

const registerSchema = Joi.object({
  tenDangNhap: Joi.string().max(17).required().messages({
    "any.required": "Tên đăng nhập là bắt buộc",
    "string.empty": "Tên đăng nhập không được để trống"
  }),

  hoTen: Joi.string().max(50).required().messages({
    "any.required": "Họ tên là bắt buộc",
    "string.empty": "Họ tên không được để trống"
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Email là bắt buộc",
    "string.email": "Email không hợp lệ",
    "string.empty": "Email không được để trống"
  }),

  sdt: Joi.string().max(10).allow(null, ""),

  matKhau: Joi.string().min(6).required().messages({
    "any.required": "Mật khẩu là bắt buộc",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự"
  }),

  maVaiTro: Joi.string()
    .valid("ADMIN", "CANBO", "NVKT", "CONGNAN")
    .default("CONGNAN"),

  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  diaChi: Joi.string().max(100).allow(null, "")
});

const updateProfileSchema = Joi.object({
  hoTen: Joi.string().max(50),
  email: Joi.string().email(),
  sdt: Joi.string().max(10).allow(null, ""),
  maXaPhuong: Joi.string().max(20).allow(null, ""),
  maTuyenDuong: Joi.string().max(20).allow(null, ""),
  diaChi: Joi.string().max(100).allow(null, "")
}).min(1);

const changePasswordSchema = Joi.object({
  matKhauCu: Joi.string().required().messages({
    "any.required": "Mật khẩu cũ là bắt buộc",
    "string.empty": "Mật khẩu cũ không được để trống"
  }),

  matKhauMoi: Joi.string().min(6).required().messages({
    "any.required": "Mật khẩu mới là bắt buộc",
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự"
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema
};