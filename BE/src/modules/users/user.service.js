const bcrypt = require("bcryptjs");

const userRepository = require("./user.repository");
const userValidator = require("./user.validator");
const AppError = require("../../common/errors/AppError");

const getUsers = async (query) => {
  return userRepository.findUsers(query);
};

const getUserById = async (maNguoiDung) => {
  const user = await userRepository.findUserById(maNguoiDung);

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return user;
};

const createUser = async (body) => {
  const { error, value } = userValidator.createUserSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu người dùng không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const existedEmail = await userRepository.findUserByEmail(value.email);

  if (existedEmail) {
    throw new AppError("Email đã tồn tại", 409);
  }

  const maNguoiDung = await userRepository.generateUserId();
  const hashedPassword = await bcrypt.hash(value.matKhau, 10);

  return userRepository.createUser({
    maNguoiDung,
    ...value,
    matKhauHash: hashedPassword
  });
};

const updateUser = async (maNguoiDung, body) => {
  const existed = await userRepository.findUserById(maNguoiDung);

  if (!existed) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const { error, value } = userValidator.updateUserSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật người dùng không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.email && value.email !== existed.Email) {
    const existedEmail = await userRepository.findUserByEmail(value.email);

    if (existedEmail) {
      throw new AppError("Email đã tồn tại", 409);
    }
  }

  return userRepository.updateUser(maNguoiDung, value);
};

const resetPassword = async (maNguoiDung, body) => {
  const existed = await userRepository.findUserById(maNguoiDung);

  if (!existed) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const { error, value } = userValidator.resetPasswordSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu đặt lại mật khẩu không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const hashedPassword = await bcrypt.hash(value.matKhauMoi, 10);

  return userRepository.updatePassword(maNguoiDung, hashedPassword);
};

const deleteUser = async (maNguoiDung) => {
  const existed = await userRepository.findUserById(maNguoiDung);

  if (!existed) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return userRepository.deleteUser(maNguoiDung);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser
};