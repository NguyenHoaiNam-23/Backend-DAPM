const { getConnection, sql } = require("../../database/connection");

const assignmentRepository = require("./assignment.repository");
const assignmentDetailRepository = require("./assignmentDetail.repository");
const assignmentImageRepository = require("./assignmentImage.repository");

const assignmentValidator = require("./assignment.validator");
const AppError = require("../../common/errors/AppError");

const buildFilePathForDb = (file) => {
  if (!file) {
    return null;
  }

  return file.path.replace(/\\/g, "/");
};

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

const getFilesByField = (files, fieldName) => {
  if (!files || !files[fieldName]) {
    return [];
  }

  return files[fieldName];
};

/**
 * POST /api/v1/assignments
 */
const createAssignment = async ({ body, file, currentUser }) => {
  const { error, value } = assignmentValidator.createAssignmentSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu phân công không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const plan = await assignmentRepository.findPlanById(value.maKHCV);

  if (!plan) {
    throw new AppError("Không tìm thấy kế hoạch công việc", 404);
  }

  if (plan.TrangThai !== "Đã phê duyệt") {
    throw new AppError("Chỉ được phân công khi kế hoạch công việc đã được duyệt", 409);
  }

  const nguoiTao =
    currentUser?.maNguoiDung ||
    value.nguoiTao ||
    null;

  if (nguoiTao) {
    const creator = await assignmentRepository.findUserById(nguoiTao);

    if (!creator) {
      throw new AppError("Mã người tạo phân công không tồn tại", 404);
    }
  }

  const workers = parseJsonArray(value.danhSachCongNhan, "danhSachCongNhan");

  if (workers.length === 0) {
    throw new AppError("Danh sách công nhân phải có ít nhất một người", 400);
  }

  const normalizedWorkers = [];

  for (const worker of workers) {
    const validation = assignmentValidator.workerAssignmentItemSchema.validate(worker, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validation.error) {
      throw new AppError(
        "Dữ liệu công nhân phân công không hợp lệ",
        400,
        validation.error.details.map((item) => item.message)
      );
    }

    const checkedWorker = validation.value;

    const workerUser = await assignmentRepository.findUserById(checkedWorker.maCongNhan);

    if (!workerUser) {
      throw new AppError(`Mã công nhân ${checkedWorker.maCongNhan} không tồn tại`, 404);
    }

    if (new Date(checkedWorker.thoiGianBatDau) > new Date(checkedWorker.thoiGianKetThuc)) {
      throw new AppError(`Dòng công nhân ${checkedWorker.maCongNhan}: thời gian bắt đầu phải nhỏ hơn thời gian kết thúc`, 400);
    }

    normalizedWorkers.push(checkedWorker);
  }

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const maKHPC = await assignmentRepository.generateAssignmentId();

    const assignment = await assignmentRepository.createAssignment(
      {
        maKHPC,
        maKHCV: value.maKHCV,
        tieuDe: value.tieuDe,
        filePDF: buildFilePathForDb(file),
        nguoiTao,
        trangThaiNghiemThu: "Chưa nghiệm thu"
      },
      transaction
    );

    const details = [];

    for (const worker of normalizedWorkers) {
      const maChiTiet = await assignmentDetailRepository.generateAssignmentDetailId(transaction);

      const detail = await assignmentDetailRepository.createAssignmentDetail(
        {
          maChiTiet,
          maKHPC,
          maCongNhan: worker.maCongNhan,
          congViecCuThe: worker.congViecCuThe,
          thoiGianBatDau: worker.thoiGianBatDau,
          thoiGianKetThuc: worker.thoiGianKetThuc,
          yeuCauDanhGia: worker.yeuCauDanhGia || null
        },
        transaction
      );

      details.push(detail);
    }

    await transaction.commit();

    return {
      assignment,
      details
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * GET /api/v1/assignments
 */
const getAssignments = async (query) => {
  return assignmentRepository.findAssignments(query);
};

/**
 * GET /api/v1/assignments/:maKHPC
 */
const getAssignmentById = async (maKHPC) => {
  const assignment = await assignmentRepository.findAssignmentById(maKHPC);

  if (!assignment) {
    throw new AppError("Không tìm thấy kế hoạch phân công", 404);
  }

  const details = await assignmentDetailRepository.findDetailsByAssignmentId(maKHPC);

  const detailResults = [];

  for (const detail of details) {
    const beforeImages = await assignmentImageRepository.findBeforeImagesByDetailId(detail.MaChiTiet);
    const afterImages = await assignmentImageRepository.findAfterImagesByDetailId(detail.MaChiTiet);

    detailResults.push({
      ...detail,
      beforeImages,
      afterImages
    });
  }

  return {
    assignment,
    details: detailResults
  };
};

/**
 * GET /api/v1/assignments/my-tasks
 */
const getMyTasks = async ({ query, currentUser }) => {
  const maCongNhan =
    currentUser?.maNguoiDung ||
    query.maCongNhan;

  if (!maCongNhan) {
    throw new AppError("Thiếu mã công nhân", 400);
  }

  return assignmentDetailRepository.findMyTasks({
    ...query,
    maCongNhan
  });
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/accept
 */
const acceptTask = async ({ maChiTiet, body, currentUser }) => {
  const detail = await assignmentDetailRepository.findAssignmentDetailById(maChiTiet);

  if (!detail) {
    throw new AppError("Không tìm thấy chi tiết phân công", 404);
  }

  const { error, value } = assignmentValidator.acceptTaskSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu xác nhận nhận việc không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maCongNhan =
    currentUser?.maNguoiDung ||
    value.maCongNhan ||
    null;

  if (maCongNhan && detail.MaCongNhan !== maCongNhan) {
    throw new AppError("Công nhân không có quyền xác nhận công việc này", 403);
  }

  if (detail.XacNhanLam) {
    throw new AppError("Công việc đã được xác nhận nhận trước đó", 409);
  }

  if (!value.xacNhanNhanViec) {
    throw new AppError("Giá trị xác nhận nhận việc không hợp lệ", 400);
  }

  return assignmentDetailRepository.acceptTask(maChiTiet);
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/execute
 */
const executeTask = async ({ maChiTiet, body, files, currentUser }) => {
  const detail = await assignmentDetailRepository.findAssignmentDetailById(maChiTiet);

  if (!detail) {
    throw new AppError("Không tìm thấy chi tiết phân công", 404);
  }

  const { error, value } = assignmentValidator.executeTaskSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật kết quả thực hiện không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maCongNhan =
    currentUser?.maNguoiDung ||
    value.maCongNhan ||
    null;

  if (maCongNhan && detail.MaCongNhan !== maCongNhan) {
    throw new AppError("Công nhân không có quyền cập nhật công việc này", 403);
  }

  if (!detail.XacNhanLam) {
    throw new AppError("Công nhân cần xác nhận nhận việc trước khi cập nhật kết quả", 409);
  }

  const beforeFiles = getFilesByField(files, "anhTruoc");
  const afterFiles = getFilesByField(files, "anhSau");

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const updatedDetail = await assignmentDetailRepository.executeTask(maChiTiet, {
      xacNhanHoanTat: value.xacNhanHoanTat,
      khoiLuongHoanThanh: value.khoiLuongHoanThanh || null,
      lyDo: value.lyDo || null
    });

    const beforeImages = [];

    for (const file of beforeFiles) {
      const maAnhTruoc = await assignmentImageRepository.generateBeforeImageId(transaction);

      const image = await assignmentImageRepository.createBeforeImage(
        {
          maAnhTruoc,
          maChiTiet,
          duongDanAnh: buildFilePathForDb(file),
          moTa: file.originalname
        },
        transaction
      );

      beforeImages.push(image);
    }

    const afterImages = [];

    for (const file of afterFiles) {
      const maAnhSau = await assignmentImageRepository.generateAfterImageId(transaction);

      const image = await assignmentImageRepository.createAfterImage(
        {
          maAnhSau,
          maChiTiet,
          duongDanAnh: buildFilePathForDb(file),
          moTa: file.originalname
        },
        transaction
      );

      afterImages.push(image);
    }

    await transaction.commit();

    return {
      detail: updatedDetail,
      beforeImages,
      afterImages
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * GET /api/v1/assignments/rework-tasks
 */
const getReworkTasks = async ({ query, currentUser }) => {
  const maCongNhan =
    currentUser?.maNguoiDung ||
    query.maCongNhan;

  if (!maCongNhan) {
    throw new AppError("Thiếu mã công nhân", 400);
  }

  return assignmentDetailRepository.findReworkTasks({
    ...query,
    maCongNhan
  });
};

/**
 * PUT /api/v1/assignments/details/:maChiTiet/rework
 */
const reworkTask = async ({ maChiTiet, body, files, currentUser }) => {
  const detail = await assignmentDetailRepository.findAssignmentDetailById(maChiTiet);

  if (!detail) {
    throw new AppError("Không tìm thấy chi tiết phân công", 404);
  }

  if (detail.KetQuaNghiemThuChiTiet !== "Không đạt") {
    throw new AppError("Chỉ công việc không đạt mới được gửi lại kết quả làm lại", 409);
  }

  const { error, value } = assignmentValidator.reworkTaskSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu làm lại không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maCongNhan =
    currentUser?.maNguoiDung ||
    value.maCongNhan ||
    null;

  if (maCongNhan && detail.MaCongNhan !== maCongNhan) {
    throw new AppError("Công nhân không có quyền gửi lại công việc này", 403);
  }

  const beforeFiles = getFilesByField(files, "anhTruoc");
  const afterFiles = getFilesByField(files, "anhSau");

  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const updatedDetail = await assignmentDetailRepository.reworkTask(maChiTiet, {
      khoiLuongHoanThanh: value.khoiLuongHoanThanh || null,
      ghiChuLamLai: value.ghiChuLamLai || null
    });

    const beforeImages = [];

    for (const file of beforeFiles) {
      const maAnhTruoc = await assignmentImageRepository.generateBeforeImageId(transaction);

      const image = await assignmentImageRepository.createBeforeImage(
        {
          maAnhTruoc,
          maChiTiet,
          duongDanAnh: buildFilePathForDb(file),
          moTa: file.originalname
        },
        transaction
      );

      beforeImages.push(image);
    }

    const afterImages = [];

    for (const file of afterFiles) {
      const maAnhSau = await assignmentImageRepository.generateAfterImageId(transaction);

      const image = await assignmentImageRepository.createAfterImage(
        {
          maAnhSau,
          maChiTiet,
          duongDanAnh: buildFilePathForDb(file),
          moTa: file.originalname
        },
        transaction
      );

      afterImages.push(image);
    }

    await transaction.commit();

    return {
      detail: updatedDetail,
      beforeImages,
      afterImages
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMyTasks,
  acceptTask,
  executeTask,
  getReworkTasks,
  reworkTask
};