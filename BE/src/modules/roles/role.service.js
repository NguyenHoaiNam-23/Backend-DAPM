const roleRepository = require("./role.repository");
const roleValidator = require("./role.validator");
const AppError = require("../../common/errors/AppError");

const getRoles = async () => {
  return roleRepository.findRoles();
};

const getRoleById = async (maVaiTro) => {
  const role = await roleRepository.findRoleById(maVaiTro);

  if (!role) {
    throw new AppError("Không tìm thấy vai trò", 404);
  }

  return role;
};

const createRole = async (body) => {
  const { error, value } = roleValidator.createRoleSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu vai trò không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const existed = await roleRepository.findRoleById(value.maVaiTro);

  if (existed) {
    throw new AppError("Mã vai trò đã tồn tại", 409);
  }

  return roleRepository.createRole(value);
};

const updateRole = async (maVaiTro, body) => {
  const existed = await roleRepository.findRoleById(maVaiTro);

  if (!existed) {
    throw new AppError("Không tìm thấy vai trò", 404);
  }

  const { error, value } = roleValidator.updateRoleSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật vai trò không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return roleRepository.updateRole(maVaiTro, value);
};

const deleteRole = async (maVaiTro) => {
  const existed = await roleRepository.findRoleById(maVaiTro);

  if (!existed) {
    throw new AppError("Không tìm thấy vai trò", 404);
  }

  const userCount = await roleRepository.countUsersByRole(maVaiTro);

  if (userCount > 0) {
    throw new AppError("Không thể xóa vai trò đang được gán cho người dùng", 409);
  }

  return roleRepository.deleteRole(maVaiTro);
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};