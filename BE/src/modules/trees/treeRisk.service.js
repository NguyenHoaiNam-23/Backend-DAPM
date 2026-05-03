const treeRepository = require("./tree.repository");
const treeValidator = require("./tree.validator");
const AppError = require("../../common/errors/AppError");

/**
 * Lấy danh sách cây nguy hiểm
 */
const getDangerousTrees = async (query) => {
  return treeRepository.findDangerousTrees(query);
};

/**
 * Đánh giá mức độ nguy hiểm của cây
 *
 * Vì SQL hiện chưa có bảng DanhGiaCayNguyHiem, nên xử lý theo hướng:
 * 1. Cập nhật CayXanh.TrangThaiSucKhoe = N'Nguy hiểm'
 * 2. Nếu có MaBaoCao thì cập nhật/ghi nhận ChiTietBaoCao liên quan
 * 3. Trả về cây sau cập nhật
 */
const createRiskAssessment = async ({ maCay, body, currentUser }) => {
  const existed = await treeRepository.findTreeById(maCay);

  if (!existed) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  const { error, value } = treeValidator.createRiskAssessmentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu đánh giá nguy hiểm không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.maBaoCao) {
    const report = await treeRepository.findIncidentById(value.maBaoCao);

    if (!report) {
      throw new AppError("Mã báo cáo sự cố không tồn tại", 404);
    }
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.maNguoiCapNhat ||
    null;

  const updatedTree = await treeRepository.markTreeAsDangerous(maCay, {
    mucDoNguyHiem: value.mucDoNguyHiem,
    moTaDanhGia: value.moTaDanhGia,
    deXuatXuLy: value.deXuatXuLy,
    maBaoCao: value.maBaoCao || null,
    maNguoiCapNhat
  });

  return updatedTree;
};

module.exports = {
  getDangerousTrees,
  createRiskAssessment
};