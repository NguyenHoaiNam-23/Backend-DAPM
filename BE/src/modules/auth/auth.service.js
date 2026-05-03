const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authRepository = require("./auth.repository");
const authValidator = require("./auth.validator");
const AppError = require("../../common/errors/AppError");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../../config/jwt.config");

const buildToken = (user) => {
  return jwt.sign(
    {
      maNguoiDung: user.MaNguoiDung,
      email: user.Email,
      vaiTro: user.MaVaiTro
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

const verifyPassword = async (plainPassword, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  const isBcryptHash =
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$");

  if (isBcryptHash) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
};

const login = async (body) => {
  const { error, value } = authValidator.loginSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu đăng nhập không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const user = await authRepository.findUserByEmail(value.email);

  if (!user) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  if (user.TrangThai && user.TrangThai !== "Hoạt động") {
    throw new AppError("Tài khoản đã bị khóa hoặc ngưng hoạt động", 403);
  }

  const isPasswordValid = await verifyPassword(value.matKhau, user.MatKhauHash);

  if (!isPasswordValid) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  const token = buildToken(user);

  delete user.MatKhauHash;

  return {
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: JWT_EXPIRES_IN,
    user
  };
};

const register = async (body) => {
  const { error, value } = authValidator.registerSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu đăng ký không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const existedEmail = await authRepository.findUserByEmail(value.email);

  if (existedEmail) {
    throw new AppError("Email đã tồn tại", 409);
  }

  const existedUsername = await authRepository.findUserByUsername(value.tenDangNhap);

  if (existedUsername) {
    throw new AppError("Tên đăng nhập đã tồn tại", 409);
  }

  const maNguoiDung = await authRepository.generateUserId();
  const hashedPassword = await bcrypt.hash(value.matKhau, 10);

  return authRepository.createUser({
    maNguoiDung,
    tenDangNhap: value.tenDangNhap,
    hoTen: value.hoTen,
    email: value.email,
    sdt: value.sdt || null,
    matKhauHash: hashedPassword,
    trangThai: "Hoạt động",
    maVaiTro: "NGUOIDAN",
    maXaPhuong: value.maXaPhuong || null,
    maTuyenDuong: value.maTuyenDuong || null,
    diaChi: value.diaChi || null
  });
};

const getProfile = async (currentUser) => {
  const user = await authRepository.findUserById(currentUser.maNguoiDung);

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return user;
};

const updateProfile = async ({ body, currentUser }) => {
  const { error, value } = authValidator.updateProfileSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật hồ sơ không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  if (value.email) {
    const existedEmail = await authRepository.findUserByEmail(value.email);

    if (
      existedEmail &&
      existedEmail.MaNguoiDung !== currentUser.maNguoiDung
    ) {
      throw new AppError("Email đã tồn tại", 409);
    }
  }

  const updated = await authRepository.updateProfile(currentUser.maNguoiDung, value);

  if (!updated) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return updated;
};

const changePassword = async ({ body, currentUser }) => {
  const { error, value } = authValidator.changePasswordSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu đổi mật khẩu không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const user = await authRepository.findUserByEmail(currentUser.email);

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const isPasswordValid = await verifyPassword(value.matKhauCu, user.MatKhauHash);

  if (!isPasswordValid) {
    throw new AppError("Mật khẩu cũ không đúng", 400);
  }

  const hashedPassword = await bcrypt.hash(value.matKhauMoi, 10);

  await authRepository.updatePassword(user.MaNguoiDung, hashedPassword);

  return {
    maNguoiDung: user.MaNguoiDung
  };
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword
};
