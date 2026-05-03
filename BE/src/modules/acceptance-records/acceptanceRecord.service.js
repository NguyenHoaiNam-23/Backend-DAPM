const fs = require("fs");
const path = require("path");

const acceptanceRecordRepository = require("./acceptanceRecord.repository");
const acceptanceRecordValidator = require("./acceptanceRecord.validator");
const AppError = require("../../common/errors/AppError");

const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

const removeFileSafely = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Không thể xóa file:", error.message);
  }
};

const validateForeignKeys = async ({ maLoaiCongViec, maXaPhuong, maTuyenDuong, nguoiTao, nguoiCapNhat }) => {
  if (maLoaiCongViec) {
    const workType = await acceptanceRecordRepository.findWorkTypeById(maLoaiCongViec);

    if (!workType) {
      throw new AppError("Mã loại công việc không tồn tại", 404);
    }
  }

  if (maXaPhuong) {
    const ward = await acceptanceRecordRepository.findWardById(maXaPhuong);

    if (!ward) {
      throw new AppError("Mã xã phường không tồn tại", 404);
    }
  }

  if (maTuyenDuong) {
    const street = await acceptanceRecordRepository.findStreetById(maTuyenDuong);

    if (!street) {
      throw new AppError("Mã tuyến đường không tồn tại", 404);
    }

    if (maXaPhuong && street.MaXaPhuong !== maXaPhuong) {
      throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
    }
  }

  if (nguoiTao) {
    const user = await acceptanceRecordRepository.findUserById(nguoiTao);

    if (!user) {
      throw new AppError("Mã người tạo không tồn tại", 404);
    }
  }

  if (nguoiCapNhat) {
    const user = await acceptanceRecordRepository.findUserById(nguoiCapNhat);

    if (!user) {
      throw new AppError("Mã người cập nhật không tồn tại", 404);
    }
  }
};

/**
 * POST /api/v1/acceptance-records
 */
const createAcceptanceRecord = async ({ body, file, currentUser }) => {
  const { error, value } = acceptanceRecordValidator.createAcceptanceRecordSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    removeFileSafely(file?.path);

    throw new AppError(
      "Dữ liệu hồ sơ nghiệm thu không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (!file) {
    throw new AppError("File hồ sơ nghiệm thu là bắt buộc", 400);
  }

  const nguoiTao =
    currentUser?.maNguoiDung ||
    value.nguoiTao ||
    null;

  await validateForeignKeys({
    maLoaiCongViec: value.maLoaiCongViec,
    maXaPhuong: value.maXaPhuong,
    maTuyenDuong: value.maTuyenDuong,
    nguoiTao
  });

  const maHoSo = await acceptanceRecordRepository.generateAcceptanceRecordId();

  return acceptanceRecordRepository.createAcceptanceRecord({
    maHoSo,
    maLoaiCongViec: value.maLoaiCongViec,
    tieuDe: value.tieuDe,
    moTa: value.moTa || null,
    filePDF: buildFilePathForDb(file),
    nguoiTao,
    maXaPhuong: value.maXaPhuong,
    maTuyenDuong: value.maTuyenDuong
  });
};

/**
 * GET /api/v1/acceptance-records
 */
const getAcceptanceRecords = async (query) => {
  return acceptanceRecordRepository.findAcceptanceRecords(query);
};

/**
 * GET /api/v1/acceptance-records/:maHoSo
 */
const getAcceptanceRecordById = async (maHoSo) => {
  const record = await acceptanceRecordRepository.findAcceptanceRecordById(maHoSo);

  if (!record) {
    throw new AppError("Không tìm thấy hồ sơ nghiệm thu", 404);
  }

  return record;
};

/**
 * GET /api/v1/acceptance-records/:maHoSo/download
 */
const getAcceptanceRecordFile = async (maHoSo) => {
  const record = await acceptanceRecordRepository.findAcceptanceRecordById(maHoSo);

  if (!record) {
    throw new AppError("Không tìm thấy hồ sơ nghiệm thu", 404);
  }

  if (!record.FilePDF) {
    throw new AppError("Hồ sơ nghiệm thu chưa có file đính kèm", 404);
  }

  const filePath = path.resolve(record.FilePDF);

  if (!fs.existsSync(filePath)) {
    throw new AppError("File hồ sơ nghiệm thu không tồn tại trên server", 404);
  }

  return {
    filePath,
    fileName: path.basename(filePath)
  };
};

/**
 * PUT /api/v1/acceptance-records/:maHoSo
 */
const updateAcceptanceRecord = async ({ maHoSo, body, file, currentUser }) => {
  const existed = await acceptanceRecordRepository.findAcceptanceRecordById(maHoSo);

  if (!existed) {
    removeFileSafely(file?.path);
    throw new AppError("Không tìm thấy hồ sơ nghiệm thu", 404);
  }

  const { error, value } = acceptanceRecordValidator.updateAcceptanceRecordSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    removeFileSafely(file?.path);

    throw new AppError(
      "Dữ liệu cập nhật hồ sơ nghiệm thu không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const nguoiCapNhat =
    currentUser?.maNguoiDung ||
    value.nguoiCapNhat ||
    null;

  const finalMaXaPhuong = value.maXaPhuong || existed.MaXaPhuong;
  const finalMaTuyenDuong = value.maTuyenDuong || existed.MaTuyenDuong;

  await validateForeignKeys({
    maLoaiCongViec: value.maLoaiCongViec,
    maXaPhuong: finalMaXaPhuong,
    maTuyenDuong: finalMaTuyenDuong,
    nguoiCapNhat
  });

  const updatedRecord = await acceptanceRecordRepository.updateAcceptanceRecord(maHoSo, {
    ...value,
    filePDF: buildFilePathForDb(file),
    nguoiCapNhat
  });

  /**
   * Nếu upload file mới thành công, xóa file cũ để tránh rác.
   */
  if (file && existed.FilePDF && existed.FilePDF !== updatedRecord.FilePDF) {
    removeFileSafely(path.resolve(existed.FilePDF));
  }

  return updatedRecord;
};

/**
 * DELETE /api/v1/acceptance-records/:maHoSo
 */
const deleteAcceptanceRecord = async (maHoSo) => {
  const existed = await acceptanceRecordRepository.findAcceptanceRecordById(maHoSo);

  if (!existed) {
    throw new AppError("Không tìm thấy hồ sơ nghiệm thu", 404);
  }

  const result = await acceptanceRecordRepository.deleteAcceptanceRecord(maHoSo);

  if (existed.FilePDF) {
    removeFileSafely(path.resolve(existed.FilePDF));
  }

  return result;
};

module.exports = {
  createAcceptanceRecord,
  getAcceptanceRecords,
  getAcceptanceRecordById,
  getAcceptanceRecordFile,
  updateAcceptanceRecord,
  deleteAcceptanceRecord
};