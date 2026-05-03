const AppError = require("../../common/errors/AppError");
const catalogValidator = require("./catalog.validator");
const workTypeRepository = require("./workType.repository");

const getWorkTypes = async (query) => workTypeRepository.findWorkTypes(query);

const getWorkTypeById = async (maLoaiCongViec) => {
  const workType = await workTypeRepository.findWorkTypeById(maLoaiCongViec);

  if (!workType) {
    throw new AppError("Không tìm thấy loại công việc", 404);
  }

  return workType;
};

const createWorkType = async (payload) => {
  const { error, value } = catalogValidator.createWorkTypeSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu loại công việc không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maLoaiCongViec = await workTypeRepository.generateWorkTypeId();

  return workTypeRepository.createWorkType({
    maLoaiCongViec,
    ...value
  });
};

const updateWorkType = async (maLoaiCongViec, payload) => {
  const existed = await workTypeRepository.findWorkTypeById(maLoaiCongViec);

  if (!existed) {
    throw new AppError("Không tìm thấy loại công việc", 404);
  }

  const { error, value } = catalogValidator.updateWorkTypeSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật loại công việc không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return workTypeRepository.updateWorkType(maLoaiCongViec, value);
};

const deleteWorkType = async (maLoaiCongViec) => {
  const existed = await workTypeRepository.findWorkTypeById(maLoaiCongViec);

  if (!existed) {
    throw new AppError("Không tìm thấy loại công việc", 404);
  }

  if (await workTypeRepository.isWorkTypeUsed(maLoaiCongViec)) {
    throw new AppError(
      "Không thể xóa loại công việc vì đã được sử dụng trong kế hoạch hoặc hồ sơ nghiệm thu",
      409
    );
  }

  return workTypeRepository.deleteWorkType(maLoaiCongViec);
};

module.exports = {
  getWorkTypes,
  getWorkTypeById,
  createWorkType,
  updateWorkType,
  deleteWorkType
};
