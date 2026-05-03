const Joi = require("joi");

/**
 * DANH MỤC CÂY TRỒNG
 */

const createTreeTypeSchema = Joi.object({
  tenCayTrong: Joi.string().max(100).required().messages({
    "any.required": "Tên cây trồng là bắt buộc",
    "string.empty": "Tên cây trồng không được để trống"
  }),

  chieuCaoTruongThanh: Joi.number().min(0).allow(null),
  duongKinhTruongThanh: Joi.number().min(0).allow(null),

  hinhThucTanCay: Joi.string().max(20).allow(null, ""),
  dangLa: Joi.string().max(20).allow(null, ""),
  mauLa: Joi.string().max(50).allow(null, ""),
  kyRungLa: Joi.string().max(20).allow(null, ""),
  kyNoHoa: Joi.string().max(20).allow(null, ""),
  mauHoa: Joi.string().max(50).allow(null, ""),

  loaiCay: Joi.string().max(50).allow(null, ""),
  moTa: Joi.string().max(500).allow(null, ""),
  trangThai: Joi.string().max(50).allow(null, "")
});

const updateTreeTypeSchema = Joi.object({
  tenCayTrong: Joi.string().max(100),
  chieuCaoTruongThanh: Joi.number().min(0).allow(null),
  duongKinhTruongThanh: Joi.number().min(0).allow(null),

  hinhThucTanCay: Joi.string().max(20).allow(null, ""),
  dangLa: Joi.string().max(20).allow(null, ""),
  mauLa: Joi.string().max(50).allow(null, ""),
  kyRungLa: Joi.string().max(20).allow(null, ""),
  kyNoHoa: Joi.string().max(20).allow(null, ""),
  mauHoa: Joi.string().max(50).allow(null, ""),

  loaiCay: Joi.string().max(50).allow(null, ""),
  moTa: Joi.string().max(500).allow(null, ""),
  trangThai: Joi.string().max(50).allow(null, "")
}).min(1);

/**
 * DANH MỤC CÔNG VIỆC
 */

const createWorkTypeSchema = Joi.object({
  tenCongViec: Joi.string().max(150).required().messages({
    "any.required": "Tên công việc là bắt buộc",
    "string.empty": "Tên công việc không được để trống"
  }),

  moTaCV: Joi.string().max(500).allow(null, "")
});

const updateWorkTypeSchema = Joi.object({
  tenCongViec: Joi.string().max(150),
  moTaCV: Joi.string().max(500).allow(null, "")
}).min(1);

/**
 * XÃ PHƯỜNG
 */

const createWardSchema = Joi.object({
  maHanhChinh: Joi.number().integer().allow(null),
  tenXaPhuong: Joi.string().max(150).required().messages({
    "any.required": "Tên xã phường là bắt buộc",
    "string.empty": "Tên xã phường không được để trống"
  }),
  loaiDanhMuc: Joi.string().max(10).allow(null, "")
});

const updateWardSchema = Joi.object({
  maHanhChinh: Joi.number().integer().allow(null),
  tenXaPhuong: Joi.string().max(150),
  loaiDanhMuc: Joi.string().max(10).allow(null, "")
}).min(1);

/**
 * TUYẾN ĐƯỜNG
 */

const createStreetSchema = Joi.object({
  tenTuyenDuong: Joi.string().max(150).required().messages({
    "any.required": "Tên tuyến đường là bắt buộc",
    "string.empty": "Tên tuyến đường không được để trống"
  }),

  loaiDuong: Joi.string().max(50).allow(null, ""),

  maXaPhuong: Joi.string().max(20).required().messages({
    "any.required": "Mã xã phường là bắt buộc",
    "string.empty": "Mã xã phường không được để trống"
  })
});

const updateStreetSchema = Joi.object({
  tenTuyenDuong: Joi.string().max(150),
  loaiDuong: Joi.string().max(50).allow(null, ""),
  maXaPhuong: Joi.string().max(20)
}).min(1);

module.exports = {
  createTreeTypeSchema,
  updateTreeTypeSchema,

  createWorkTypeSchema,
  updateWorkTypeSchema,

  createWardSchema,
  updateWardSchema,

  createStreetSchema,
  updateStreetSchema
};