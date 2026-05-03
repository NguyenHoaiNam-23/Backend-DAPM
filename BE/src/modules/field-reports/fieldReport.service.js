const { getConnection, sql } = require("../../database/connection");

const fieldReportRepository = require("./fieldReport.repository");
const fieldReportValidator = require("./fieldReport.validator");
const AppError = require("../../common/errors/AppError");

const parseJsonArray = (value, fieldName) => {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    return parsed;
  } catch (error) {
    throw new AppError(`${fieldName} phải là JSON array hợp lệ`, 400);
  }
};

const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

const createFieldReport = async ({ body, files, currentUser }) => {
  const { error, value } = fieldReportValidator.createFieldReportSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu báo cáo hiện trường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiBaoCao =
    currentUser?.maNguoiDung ||
    value.maNguoiBaoCao ||
    null;

  if (maNguoiBaoCao) {
    const user = await fieldReportRepository.findUserById(maNguoiBaoCao);

    if (!user) {
      throw new AppError("Mã người báo cáo không tồn tại", 404);
    }
  }

  const details = parseJsonArray(value.chiTietBaoCao, "chiTietBaoCao");

  if (details.length === 0) {
    throw new AppError("Chi tiết báo cáo hiện trường không được rỗng", 400);
  }

  const normalizedDetails = [];

  for (const item of details) {
    const validation = fieldReportValidator.fieldReportDetailSchema.validate(item, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validation.error) {
      throw new AppError(
        "Chi tiết báo cáo hiện trường không hợp lệ",
        400,
        validation.error.details.map((detail) => detail.message)
      );
    }

    const tree = await fieldReportRepository.findTreeById(validation.value.maCay);

    if (!tree) {
      throw new AppError(`Mã cây ${validation.value.maCay} không tồn tại`, 404);
    }

    normalizedDetails.push({
      ...validation.value,
      maTuyenDuong: tree.MaTuyenDuong,
      maXaPhuong: tree.MaXaPhuong
    });
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const maBaoCao = await fieldReportRepository.generateReportId();

    const report = await fieldReportRepository.createFieldReport(
      {
        maBaoCao,
        maNguoiBaoCao,
        maXaPhuong: value.maXaPhuong,
        diaChiCuThe: value.diaChiCuThe,
        noiDungBaoCao: value.noiDungBaoCao
      },
      transaction
    );

    const insertedDetails = [];

    for (const detail of normalizedDetails) {
      const maChiTietBaoCao = await fieldReportRepository.generateDetailId(transaction);

      const insertedDetail = await fieldReportRepository.createFieldReportDetail(
        {
          maChiTietBaoCao,
          maBaoCao,
          maCay: detail.maCay,
          maTuyenDuong: detail.maTuyenDuong,
          maXaPhuong: detail.maXaPhuong,
          moTaTinhTrang: detail.moTaTinhTrang,
          mucDoNguyHiem: detail.mucDoNguyHiem
        },
        transaction
      );

      insertedDetails.push(insertedDetail);
    }

    const insertedImages = [];

    for (const file of files || []) {
      const maHinhAnh = await fieldReportRepository.generateImageId(transaction);

      const insertedImage = await fieldReportRepository.createFieldReportImage(
        {
          maHinhAnh,
          maBaoCao,
          duongDanAnh: buildFilePathForDb(file),
          moTa: file.originalname
        },
        transaction
      );

      insertedImages.push(insertedImage);
    }

    await transaction.commit();

    return {
      report,
      details: insertedDetails,
      images: insertedImages
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getFieldReports = async (query) => {
  return fieldReportRepository.findFieldReports(query);
};

const updateFieldReportStatus = async ({ maBaoCao, body, currentUser }) => {
  const { error, value } = fieldReportValidator.updateFieldReportStatusSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật trạng thái báo cáo hiện trường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return fieldReportRepository.updateStatus(maBaoCao, {
    trangThaiXuLy: value.trangThaiXuLy,
    ghiChu: value.ghiChu || null,
    maNguoiXuLy: currentUser?.maNguoiDung || value.maNguoiXuLy || null
  });
};

module.exports = {
  createFieldReport,
  getFieldReports,
  updateFieldReportStatus
};