const AppError = require("../../common/errors/AppError");
const catalogValidator = require("./catalog.validator");
const streetRepository = require("./street.repository");
const wardRepository = require("./ward.repository");

const getStreets = async (query) => streetRepository.findStreets(query);

const getStreetById = async (maTuyenDuong) => {
  const street = await streetRepository.findStreetById(maTuyenDuong);

  if (!street) {
    throw new AppError("Không tìm thấy tuyến đường", 404);
  }

  return street;
};

const createStreet = async (payload) => {
  const { error, value } = catalogValidator.createStreetSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu tuyến đường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const ward = await wardRepository.findWardById(value.maXaPhuong);

  if (!ward) {
    throw new AppError("Mã xã phường không tồn tại", 404);
  }

  const maTuyenDuong = await streetRepository.generateStreetId();

  return streetRepository.createStreet({
    maTuyenDuong,
    ...value
  });
};

const updateStreet = async (maTuyenDuong, payload) => {
  const existed = await streetRepository.findStreetById(maTuyenDuong);

  if (!existed) {
    throw new AppError("Không tìm thấy tuyến đường", 404);
  }

  const { error, value } = catalogValidator.updateStreetSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật tuyến đường không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.maXaPhuong) {
    const ward = await wardRepository.findWardById(value.maXaPhuong);

    if (!ward) {
      throw new AppError("Mã xã phường không tồn tại", 404);
    }
  }

  return streetRepository.updateStreet(maTuyenDuong, value);
};

const deleteStreet = async (maTuyenDuong) => {
  const existed = await streetRepository.findStreetById(maTuyenDuong);

  if (!existed) {
    throw new AppError("Không tìm thấy tuyến đường", 404);
  }

  if (await streetRepository.isStreetUsed(maTuyenDuong)) {
    throw new AppError("Không thể xóa tuyến đường vì đã được sử dụng", 409);
  }

  return streetRepository.deleteStreet(maTuyenDuong);
};

module.exports = {
  getStreets,
  getStreetById,
  createStreet,
  updateStreet,
  deleteStreet
};
