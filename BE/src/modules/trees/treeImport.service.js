const fs = require("fs");
const ExcelJS = require("exceljs");

const treeRepository = require("./tree.repository");
const AppError = require("../../common/errors/AppError");

/**
 * Header chuẩn trong file Excel.
 *
 * Có thể đặt tên cột tiếng Việt hoặc tiếng Anh, nhưng để ổn định cho code,
 * nên khuyến nghị người dùng dùng đúng các header bên dưới.
 */
const REQUIRED_COLUMNS = [
  "MaDMCay",
  "ChieuCaoHienTai",
  "DuongKinhThanHienTai",
  "KinhDo",
  "ViDo"
];

const OPTIONAL_COLUMNS = [
  "NgayTrong",
  "NguonGoc",
  "DuongKinhTanHienTai",
  "TrangThaiSucKhoe",
  "GhiChu"
];

/**
 * Chuẩn hóa tên header:
 * - Xóa khoảng trắng đầu/cuối
 * - Xóa ký tự xuống dòng
 */
const normalizeHeader = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, "");
};

/**
 * Chuyển giá trị Excel thành string.
 */
const toStringValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value).trim();
};

/**
 * Chuyển giá trị Excel thành number.
 */
const toNumberValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
};

/**
 * Chuyển giá trị ngày từ Excel.
 *
 * ExcelJS có thể trả:
 * - Date object
 * - string
 * - number serial date
 */
const toDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

/**
 * Đọc file Excel thành mảng object.
 */
const parseExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new AppError("File Excel không có sheet dữ liệu", 400);
  }

  const headerRow = worksheet.getRow(1);
  const headerMap = {};

  headerRow.eachCell((cell, colNumber) => {
    const headerName = normalizeHeader(cell.value);
    if (headerName) {
      headerMap[headerName] = colNumber;
    }
  });

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headerMap[col]);

  if (missingColumns.length > 0) {
    throw new AppError(
      "File Excel thiếu cột bắt buộc",
      400,
      missingColumns.map((col) => `Thiếu cột ${col}`)
    );
  }

  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const getCellValue = (columnName) => {
      const colIndex = headerMap[columnName];

      if (!colIndex) {
        return null;
      }

      const cell = row.getCell(colIndex);

      if (cell && typeof cell.value === "object" && cell.value?.text) {
        return cell.value.text;
      }

      return cell.value;
    };

    const rawItem = {
      row: rowNumber,
      maDMCay: toStringValue(getCellValue("MaDMCay")),
      ngayTrong: toDateValue(getCellValue("NgayTrong")),
      nguonGoc: toStringValue(getCellValue("NguonGoc")),
      chieuCaoHienTai: toNumberValue(getCellValue("ChieuCaoHienTai")),
      duongKinhThanHienTai: toNumberValue(getCellValue("DuongKinhThanHienTai")),
      duongKinhTanHienTai: toNumberValue(getCellValue("DuongKinhTanHienTai")),
      trangThaiSucKhoe: toStringValue(getCellValue("TrangThaiSucKhoe")) || "Bình thường",
      kinhDo: toStringValue(getCellValue("KinhDo")),
      viDo: toStringValue(getCellValue("ViDo")),
      ghiChu: toStringValue(getCellValue("GhiChu"))
    };

    const isEmptyRow =
      !rawItem.maDMCay &&
      rawItem.chieuCaoHienTai === null &&
      rawItem.duongKinhThanHienTai === null &&
      !rawItem.kinhDo &&
      !rawItem.viDo;

    if (!isEmptyRow) {
      rows.push(rawItem);
    }
  });

  return rows;
};

/**
 * Validate từng dòng Excel ở mức dữ liệu cơ bản.
 */
const validateExcelRowsBasic = (rows) => {
  const validRows = [];
  const errors = [];

  for (const item of rows) {
    const rowErrors = [];

    if (!item.maDMCay) {
      rowErrors.push("MaDMCay không được để trống");
    }

    if (item.chieuCaoHienTai === null) {
      rowErrors.push("ChieuCaoHienTai phải là số và không được để trống");
    } else if (item.chieuCaoHienTai < 0) {
      rowErrors.push("ChieuCaoHienTai không được âm");
    }

    if (item.duongKinhThanHienTai === null) {
      rowErrors.push("DuongKinhThanHienTai phải là số và không được để trống");
    } else if (item.duongKinhThanHienTai < 0) {
      rowErrors.push("DuongKinhThanHienTai không được âm");
    }

    if (item.duongKinhTanHienTai !== null && item.duongKinhTanHienTai < 0) {
      rowErrors.push("DuongKinhTanHienTai không được âm");
    }

    if (!item.kinhDo) {
      rowErrors.push("KinhDo không được để trống");
    }

    if (!item.viDo) {
      rowErrors.push("ViDo không được để trống");
    }

    const longitude = Number(item.kinhDo);
    const latitude = Number(item.viDo);

    if (Number.isNaN(longitude)) {
      rowErrors.push("KinhDo phải là số");
    } else if (longitude < -180 || longitude > 180) {
      rowErrors.push("KinhDo phải nằm trong khoảng -180 đến 180");
    }

    if (Number.isNaN(latitude)) {
      rowErrors.push("ViDo phải là số");
    } else if (latitude < -90 || latitude > 90) {
      rowErrors.push("ViDo phải nằm trong khoảng -90 đến 90");
    }

    if (
      item.trangThaiSucKhoe &&
      !["Bình thường", "Tốt", "Yếu", "Nguy hiểm", "Sâu bệnh"].includes(item.trangThaiSucKhoe)
    ) {
      rowErrors.push("TrangThaiSucKhoe không hợp lệ");
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: item.row,
        errors: rowErrors
      });
    } else {
      validRows.push(item);
    }
  }

  return {
    validRows,
    errors
  };
};

/**
 * Validate nghiệp vụ:
 * - MaDMCay tồn tại
 * - maTuyenDuong tồn tại
 * - maXaPhuong tồn tại
 * - TuyenDuong thuộc XaPhuong
 */
const validateBusinessRules = async ({ rows, maTuyenDuong, maXaPhuong }) => {
  const errors = [];
  const validRows = [];

  const ward = await treeRepository.findWardById(maXaPhuong);

  if (!ward) {
    throw new AppError("Mã xã phường không tồn tại", 404);
  }

  const street = await treeRepository.findStreetById(maTuyenDuong);

  if (!street) {
    throw new AppError("Mã tuyến đường không tồn tại", 404);
  }

  if (street.MaXaPhuong !== maXaPhuong) {
    throw new AppError("Tuyến đường không thuộc xã phường đã chọn", 400);
  }

  const treeTypeCache = new Map();

  for (const item of rows) {
    const rowErrors = [];

    let treeType = treeTypeCache.get(item.maDMCay);

    if (!treeTypeCache.has(item.maDMCay)) {
      treeType = await treeRepository.findTreeTypeById(item.maDMCay);
      treeTypeCache.set(item.maDMCay, treeType);
    }

    if (!treeType) {
      rowErrors.push(`MaDMCay ${item.maDMCay} không tồn tại trong DanhMucCayTrong`);
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: item.row,
        errors: rowErrors
      });
    } else {
      validRows.push({
        ...item,
        maTuyenDuong,
        maXaPhuong
      });
    }
  }

  return {
    validRows,
    errors
  };
};

/**
 * Xóa file sau khi xử lý.
 */
const removeFileSafely = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Không thể xóa file upload tạm:", error.message);
  }
};

/**
 * Service chính import Excel.
 */
const importTreesFromExcel = async ({ file, body, currentUser }) => {
  if (!file) {
    throw new AppError("Vui lòng upload file Excel", 400);
  }

  const maTuyenDuong = body.maTuyenDuong;
  const maXaPhuong = body.maXaPhuong;

  if (!maTuyenDuong) {
    removeFileSafely(file.path);
    throw new AppError("Mã tuyến đường là bắt buộc", 400);
  }

  if (!maXaPhuong) {
    removeFileSafely(file.path);
    throw new AppError("Mã xã phường là bắt buộc", 400);
  }

  const maNguoiCapNhat =
    currentUser?.maNguoiDung ||
    body.maNguoiCapNhat ||
    null;

  try {
    const rawRows = await parseExcelFile(file.path);

    if (rawRows.length === 0) {
      throw new AppError("File Excel không có dòng dữ liệu nào", 400);
    }

    const basicValidation = validateExcelRowsBasic(rawRows);

    const businessValidation = await validateBusinessRules({
      rows: basicValidation.validRows,
      maTuyenDuong,
      maXaPhuong
    });

    const allErrors = [
      ...basicValidation.errors,
      ...businessValidation.errors
    ].sort((a, b) => a.row - b.row);

    const finalValidRows = businessValidation.validRows.map((item) => ({
      ...item,
      maNguoiCapNhat
    }));

    let insertedItems = [];

    if (finalValidRows.length > 0) {
      insertedItems = await treeRepository.bulkInsertTrees(finalValidRows);
    }

    const latestTrees = await treeRepository.findLatestTreesAfterImport({
      maTuyenDuong,
      maXaPhuong,
      limit: Math.min(finalValidRows.length, 20)
    });

    return {
      fileName: file.originalname,
      tongSoDong: rawRows.length,
      soDongHopLe: finalValidRows.length,
      soDongLoi: allErrors.length,
      soDongImportThanhCong: insertedItems.length,
      errors: allErrors,
      latestTrees
    };
  } finally {
    removeFileSafely(file.path);
  }
};

module.exports = {
  importTreesFromExcel
};