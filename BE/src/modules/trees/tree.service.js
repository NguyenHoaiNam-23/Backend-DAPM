const treeRepository = require("./tree.repository");
const treeValidator = require("./tree.validator");
const AppError = require("../../common/errors/AppError");

/**
 * Lấy danh sách cây xanh
 */
const getTrees = async (query) => {
  return treeRepository.findTrees(query);
};

/**
 * Xem chi tiết cây
 */
const getTreeById = async (maCay) => {
  const tree = await treeRepository.findTreeById(maCay);

  if (!tree) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  return tree;
};

/**
 * Tạo cây đơn lẻ
 *
 * Ghi chú:
 * SQL có trigger trg_GenerateMaCay ON CayXanh INSTEAD OF INSERT.
 * Trigger tự sinh MaCay theo TenVietTat của tuyến đường.
 * Vì vậy backend gửi MaCay dummy, trigger sẽ bỏ qua và tự sinh mã thật.
 */
const createTree = async ({ body, currentUser }) => {
  const { error, value } = treeValidator.createTreeSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cây xanh không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const treeType = await treeRepository.findTreeTypeById(value.maDMCay);

  if (!treeType) {
    throw new AppError("Mã danh mục cây không tồn tại", 404);
  }

  const ward = await treeRepository.findWardById(value.maXaPhuong);

  if (!ward) {
    throw new AppError("Mã xã phường không tồn tại", 404);
  }

  const street = await treeRepository.findStreetById(value.maTuyenDuong);

  if (!street) {
    throw new AppError("Mã tuyến đường không tồn tại", 404);
  }

  if (street.MaXaPhuong !== value.maXaPhuong) {
    throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.maNguoiCapNhat ||
    null;

  const createdTree = await treeRepository.createTree({
    ...value,
    maNguoiCapNhat
  });

  return createdTree;
};

/**
 * Cập nhật hồ sơ cây
 */
const updateTree = async ({ maCay, body, currentUser }) => {
  const existed = await treeRepository.findTreeById(maCay);

  if (!existed) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  const { error, value } = treeValidator.updateTreeSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật cây xanh không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.maDMCay) {
    const treeType = await treeRepository.findTreeTypeById(value.maDMCay);

    if (!treeType) {
      throw new AppError("Mã danh mục cây không tồn tại", 404);
    }
  }

  if (value.maXaPhuong) {
    const ward = await treeRepository.findWardById(value.maXaPhuong);

    if (!ward) {
      throw new AppError("Mã xã phường không tồn tại", 404);
    }
  }

  if (value.maTuyenDuong) {
    const street = await treeRepository.findStreetById(value.maTuyenDuong);

    if (!street) {
      throw new AppError("Mã tuyến đường không tồn tại", 404);
    }

    const targetWard = value.maXaPhuong || existed.MaXaPhuong;

    if (street.MaXaPhuong !== targetWard) {
      throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
    }
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.maNguoiCapNhat ||
    null;

  return treeRepository.updateTree(maCay, {
    ...value,
    maNguoiCapNhat
  });
};

/**
 * Cập nhật tọa độ cây trên bản đồ
 */
const updateTreeLocation = async ({ maCay, body, currentUser }) => {
  const existed = await treeRepository.findTreeById(maCay);

  if (!existed) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  const { error, value } = treeValidator.updateTreeLocationSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu vị trí cây không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.maNguoiCapNhat ||
    null;

  return treeRepository.updateTreeLocation(maCay, {
    ...value,
    maNguoiCapNhat
  });
};

/**
 * Xóa mềm / lưu trữ cây
 *
 * Không hard delete cây vì cây xanh là tài sản đô thị.
 * Khi chặt hạ / di dời / chết, chỉ cập nhật trạng thái.
 */
const archiveTree = async ({ maCay, body, currentUser }) => {
  const existed = await treeRepository.findTreeById(maCay);

  if (!existed) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  const { error, value } = treeValidator.archiveTreeSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu lưu trữ cây không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.maNguoiCapNhat ||
    null;

  return treeRepository.archiveTree(maCay, {
    ...value,
    maNguoiCapNhat
  });
};

/**
 * Lịch sử công việc / phản ánh liên quan đến cây
 */
const getTreeWorkHistory = async (maCay) => {
  const existed = await treeRepository.findTreeById(maCay);

  if (!existed) {
    throw new AppError("Không tìm thấy cây xanh", 404);
  }

  const incidentHistory = await treeRepository.findIncidentHistoryByTreeId(maCay);

  return {
    tree: existed,
    incidentHistory
  };
};

module.exports = {
  getTrees,
  getTreeById,
  createTree,
  updateTree,
  updateTreeLocation,
  archiveTree,
  getTreeWorkHistory
};