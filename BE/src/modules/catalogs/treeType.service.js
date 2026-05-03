const AppError = require("../../common/errors/AppError");
const catalogValidator = require("./catalog.validator");
const treeTypeRepository = require("./treeType.repository");

const getTreeTypes = async (query) => treeTypeRepository.findTreeTypes(query);

const getTreeTypeById = async (maDMCay) => {
  const treeType = await treeTypeRepository.findTreeTypeById(maDMCay);

  if (!treeType) {
    throw new AppError("Không tìm thấy danh mục cây trồng", 404);
  }

  return treeType;
};

const createTreeType = async (payload) => {
  const { error, value } = catalogValidator.createTreeTypeSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu danh mục cây trồng không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  const maDMCay = await treeTypeRepository.generateTreeTypeId();

  return treeTypeRepository.createTreeType({
    maDMCay,
    ...value
  });
};

const updateTreeType = async (maDMCay, payload) => {
  const existed = await treeTypeRepository.findTreeTypeById(maDMCay);

  if (!existed) {
    throw new AppError("Không tìm thấy danh mục cây trồng", 404);
  }

  const { error, value } = catalogValidator.updateTreeTypeSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new AppError(
      "Dữ liệu cập nhật danh mục cây trồng không hợp lệ",
      400,
      error.details.map((item) => item.message)
    );
  }

  return treeTypeRepository.updateTreeType(maDMCay, value);
};

const deleteTreeType = async (maDMCay) => {
  const existed = await treeTypeRepository.findTreeTypeById(maDMCay);

  if (!existed) {
    throw new AppError("Không tìm thấy danh mục cây trồng", 404);
  }

  if (await treeTypeRepository.isTreeTypeUsed(maDMCay)) {
    return treeTypeRepository.deactivateTreeType(maDMCay);
  }

  return treeTypeRepository.deleteTreeType(maDMCay);
};

module.exports = {
  getTreeTypes,
  getTreeTypeById,
  createTreeType,
  updateTreeType,
  deleteTreeType
};
