const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/jwt.config");
const AppError = require("../errors/AppError");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Thiếu token xác thực", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      maNguoiDung: decoded.maNguoiDung,
      email: decoded.email,
      vaiTro: decoded.vaiTro
    };

    return next();
  } catch (error) {
    throw new AppError("Token không hợp lệ hoặc đã hết hạn", 401);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Người dùng chưa xác thực", 401);
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      throw new AppError("Không có quyền truy cập chức năng này", 403);
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize
};