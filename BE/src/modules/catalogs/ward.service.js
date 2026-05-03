const AppError = require("../../common/errors/AppError");
const catalogValidator = require("./catalog.validator");
const wardRepository = require("./ward.repository");

const getWards = async (query) => wardRepository.findWards(query);

const getWardById = async (maXaPhuong) => {
  const ward = await wardRepository.findWardById(maXaPhuong);

  if (!ward) {
    throw new AppError("Không tìm thấy xã phường", 404);
  }

  return ward;
};

const createWard = async (payload) => {
  const { error, value } = catalogValidator.createWardSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu xã phường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maXaPhuong = await wardRepository.generateWardId();

  return wardRepository.createWard({
    maXaPhuong,
    ...value
  });
};

const updateWard = async (maXaPhuong, payload) => {
  const existed = await wardRepository.findWardById(maXaPhuong);

  if (!existed) {
    throw new AppError("Không tìm thấy xã phường", 404);
  }

  const { error, value } = catalogValidator.updateWardSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật xã phường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return wardRepository.updateWard(maXaPhuong, value);
};

const deleteWard = async (maXaPhuong) => {
  const existed = await wardRepository.findWardById(maXaPhuong);

  if (!existed) {
    throw new AppError("Không tìm thấy xã phường", 404);
  }

  if (await wardRepository.isWardUsed(maXaPhuong)) {
    throw new AppError("Không thể xóa xã phường vì đã được sử dụng", 409);
  }

  return wardRepository.deleteWard(maXaPhuong);
};

module.exports = {
  getWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard
};
