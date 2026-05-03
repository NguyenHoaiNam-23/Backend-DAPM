const fs = require("fs");
const path = require("path");

const AppError = require("../../common/errors/AppError");
const { UPLOAD_ROOT } = require("../../config/upload.config");

const resolveFilePath = (filename) => {
  if (!filename) {
    throw new AppError("Ten file khong hop le", 400);
  }

  const uploadRoot = path.resolve(UPLOAD_ROOT);
  const targetPath = path.resolve(uploadRoot, filename);
  const relativePath = path.relative(uploadRoot, targetPath);

  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new AppError("Khong tim thay file", 404);
  }

  return targetPath;
};

const getFile = async (req, res) => {
  const targetPath = resolveFilePath(req.params.filename);

  if (!fs.existsSync(targetPath)) {
    throw new AppError("Khong tim thay file", 404);
  }

  return res.sendFile(targetPath);
};

module.exports = {
  getFile
};
