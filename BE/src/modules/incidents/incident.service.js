const { getConnection, sql } = require("../../database/connection");

const incidentRepository = require("./incident.repository");
const incidentDetailRepository = require("./incidentDetail.repository");
const incidentImageRepository = require("./incidentImage.repository");
const incidentValidator = require("./incident.validator");

const AppError = require("../../common/errors/AppError");

/**
 * Parse JSON string từ multipart/form-data.
 */
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

/**
 * Chuẩn hóa đường dẫn file để lưu DB.
 */
const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

/**
 * POST /api/v1/incidents
 */
const createIncident = async ({ body, files, currentUser }) => {
  const { error, value } = incidentValidator.createIncidentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu phản ánh không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiBaoCao =
    currentUser?.maNguoiDung ||
    value.maNguoiBaoCao ||
    null;

  if (maNguoiBaoCao) {
    const user = await incidentRepository.findUserById(maNguoiBaoCao);

    if (!user) {
      throw new AppError("Mã người báo cáo không tồn tại", 404);
    }
  }

  const ward = await incidentRepository.findWardById(value.maXaPhuong);

  if (!ward) {
    throw new AppError("Mã xã phường không tồn tại", 404);
  }

  const details = parseJsonArray(value.chiTietBaoCao, "chiTietBaoCao");

  if (details.length === 0) {
    throw new AppError("Chi tiết báo cáo phải có ít nhất một cây liên quan", 400);
  }

  const normalizedDetails = [];

  for (const detail of details) {
    const validation = incidentValidator.incidentDetailItemSchema.validate(detail, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validation.error) {
      throw new AppError(
        "Dữ liệu chi tiết báo cáo không hợp lệ",
        400,
        validation.error.details.map((item) => item.message)
      );
    }

    const checkedDetail = validation.value;

    const tree = await incidentRepository.findTreeById(checkedDetail.maCay);

    if (!tree) {
      throw new AppError(`Mã cây ${checkedDetail.maCay} không tồn tại`, 404);
    }

    normalizedDetails.push({
      ...checkedDetail,
      maTuyenDuong: checkedDetail.maTuyenDuong || tree.MaTuyenDuong,
      maXaPhuong: checkedDetail.maXaPhuong || tree.MaXaPhuong
    });
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const maBaoCao = await incidentRepository.generateIncidentId();

    const incident = await incidentRepository.createIncident(
      {
        maBaoCao,
        maNguoiBaoCao,
        thoiGianBaoCao: new Date(),
        loaiPhanAnh: value.loaiPhanAnh,
        trangThaiXuLy: "Đã tiếp nhận",
        maXaPhuong: value.maXaPhuong,
        diaChiCuThe: value.diaChiCuThe,
        traLoiPhanHoi: value.noiDungPhanAnh || null
      },
      transaction
    );

    const insertedDetails = [];

    for (const detail of normalizedDetails) {
      const maChiTietBaoCao = await incidentDetailRepository.generateIncidentDetailId(transaction);

      const insertedDetail = await incidentDetailRepository.createIncidentDetail(
        {
          maChiTietBaoCao,
          maBaoCao,
          maCay: detail.maCay,
          maTuyenDuong: detail.maTuyenDuong,
          maXaPhuong: detail.maXaPhuong,
          moTaTinhTrang: detail.moTaTinhTrang || value.noiDungPhanAnh || null,
          mucDoNguyHiem: detail.mucDoNguyHiem,
          daXuLy: false
        },
        transaction
      );

      insertedDetails.push(insertedDetail);
    }

    const insertedImages = [];

    /**
     * Quy ước hiện tại:
     * - HinhAnhBaoCao không có MaBaoCao, chỉ liên kết đến MaChiTietBaoCao.
     * - Request multipart/form-data hiện đang upload ảnh ở cấp "sự cố tổng thể",
     *   không map ảnh riêng cho từng phần tử trong chiTietBaoCao.
     * - Vì vậy, nếu một sự cố có nhiều chi tiết/cây liên quan, toàn bộ ảnh upload
     *   sẽ tạm thời gắn vào chi tiết đầu tiên để tối ưu UX cho phiên bản hiện tại.
     *
     * Nếu nghiệp vụ trong tương lai yêu cầu "cây nào ảnh đó", cần đổi contract API:
     * frontend phải gửi ảnh theo từng item chiTietBaoCao (multipart theo index hoặc
     * JSON + Base64), khi đó backend mới có thể map đúng MaChiTietBaoCao tương ứng.
     */
    const firstDetail = insertedDetails[0];

    if ((files || []).length > 0 && !firstDetail) {
      throw new AppError("Không có chi tiết báo cáo để gắn hình ảnh", 400);
    }

    for (const file of files || []) {
      const maHinhAnh = await incidentImageRepository.generateImageId(transaction);

      const insertedImage = await incidentImageRepository.createIncidentImage(
        {
          maHinhAnh,
          maChiTietBaoCao: firstDetail.MaChiTietBaoCao,
          duongDanHinh: buildFilePathForDb(file),
          moTaHinh: file.originalname
        },
        transaction
      );

      insertedImages.push(insertedImage);
    }

    await transaction.commit();

    return {
      incident,
      details: insertedDetails,
      images: insertedImages
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * GET /api/v1/incidents/my
 */
const getMyIncidents = async ({ query, currentUser }) => {
  const maNguoiBaoCao =
    currentUser?.maNguoiDung ||
    query.maNguoiBaoCao;

  if (!maNguoiBaoCao) {
    throw new AppError("Thiếu mã người báo cáo", 400);
  }

  return incidentRepository.findIncidents({
    ...query,
    maNguoiBaoCao
  });
};

/**
 * GET /api/v1/incidents
 */
const getIncidents = async (query) => {
  return incidentRepository.findIncidents(query);
};

/**
 * GET /api/v1/incidents/:maBaoCao
 */
const getIncidentById = async (maBaoCao) => {
  const incident = await incidentRepository.findIncidentById(maBaoCao);

  if (!incident) {
    throw new AppError("Không tìm thấy phản ánh sự cố", 404);
  }

  const details = await incidentDetailRepository.findDetailsByIncidentId(maBaoCao);
  const images = await incidentImageRepository.findImagesByReportId(maBaoCao);

  return {
    incident,
    details,
    images
  };
};

/**
 * PUT /api/v1/incidents/:maBaoCao/status
 */
const updateIncidentStatus = async ({ maBaoCao, body, currentUser }) => {
  const existed = await incidentRepository.findIncidentById(maBaoCao);

  if (!existed) {
    throw new AppError("Không tìm thấy phản ánh sự cố", 404);
  }

  const { error, value } = incidentValidator.updateStatusSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật trạng thái không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiXuLy =
    currentUser?.maNguoiDung ||
    value.maNguoiXuLy ||
    null;

  if (maNguoiXuLy) {
    const user = await incidentRepository.findUserById(maNguoiXuLy);

    if (!user) {
      throw new AppError("Mã người xử lý không tồn tại", 404);
    }
  }

  return incidentRepository.updateIncidentStatus(maBaoCao, {
    ...value,
    maNguoiXuLy
  });
};

/**
 * PUT /api/v1/incidents/:maBaoCao/reject
 */
const rejectIncident = async ({ maBaoCao, body, currentUser }) => {
  const existed = await incidentRepository.findIncidentById(maBaoCao);

  if (!existed) {
    throw new AppError("Không tìm thấy phản ánh sự cố", 404);
  }

  const { error, value } = incidentValidator.rejectIncidentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu từ chối phản ánh không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiXuLy =
    currentUser?.maNguoiDung ||
    value.maNguoiXuLy ||
    null;

  if (maNguoiXuLy) {
    const user = await incidentRepository.findUserById(maNguoiXuLy);

    if (!user) {
      throw new AppError("Mã người xử lý không tồn tại", 404);
    }
  }

  return incidentRepository.rejectIncident(maBaoCao, {
    ...value,
    maNguoiXuLy
  });
};

/**
 * PUT /api/v1/incidents/:maBaoCao/reply
 */
const replyIncident = async ({ maBaoCao, body, file, currentUser }) => {
  const existed = await incidentRepository.findIncidentById(maBaoCao);

  if (!existed) {
    throw new AppError("Không tìm thấy phản ánh sự cố", 404);
  }

  const { error, value } = incidentValidator.replyIncidentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu phản hồi không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maNguoiXuLy =
    currentUser?.maNguoiDung ||
    value.maNguoiXuLy ||
    null;

  if (maNguoiXuLy) {
    const user = await incidentRepository.findUserById(maNguoiXuLy);

    if (!user) {
      throw new AppError("Mã người xử lý không tồn tại", 404);
    }
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const updatedIncident = await incidentRepository.replyIncident(
      maBaoCao,
      {
        traLoiPhanHoi: value.traLoiPhanHoi,
        pdfDinhKemXuLy: buildFilePathForDb(file),
        maNguoiXuLy
      },
      transaction
    );

    await incidentDetailRepository.markDetailsAsResolved(maBaoCao, transaction);

    await transaction.commit();

    return updatedIncident;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createIncident,
  getMyIncidents,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  rejectIncident,
  replyIncident
};
