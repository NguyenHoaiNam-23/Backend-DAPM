const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  MAX_FILE_SIZE_BYTES,
  TREE_IMPORT_DIR,
  INCIDENT_DIR,
  INCIDENT_REPLY_DIR,
  PLAN_DIR,
  PLAN_APPROVAL_DIR,
  ASSIGNMENT_DIR,
  ACCEPTANCE_RECORD_DIR
} = require("../../config/upload.config");

const AppError = require("../errors/AppError");

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {
      recursive: true
    });
  }
};

ensureDirExists(TREE_IMPORT_DIR);
ensureDirExists(INCIDENT_DIR);
ensureDirExists(INCIDENT_REPLY_DIR);
ensureDirExists(PLAN_DIR);
ensureDirExists(PLAN_APPROVAL_DIR);
ensureDirExists(ASSIGNMENT_DIR);
ensureDirExists(ACCEPTANCE_RECORD_DIR);

const buildStorage = (destinationDir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir);
    },

    filename: (req, file, cb) => {
      const originalExt = path.extname(file.originalname);
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${originalExt}`;
      cb(null, safeName);
    }
  });
};

const excelFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ];

  const allowedExtensions = [".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new AppError("Chỉ cho phép upload file Excel .xlsx hoặc .xls", 400));
  }

  return cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new AppError("Chỉ cho phép upload ảnh .jpg, .jpeg, .png hoặc .webp", 400));
  }

  return cb(null, true);
};

const pdfFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new AppError("Chỉ cho phép upload file PDF, DOC hoặc DOCX", 400));
  }

  return cb(null, true);
};

const mixedIncidentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf"
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new AppError("Chỉ cho phép upload ảnh hoặc file PDF", 400));
  }

  return cb(null, true);
};

const assignmentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(ext)) {
    return cb(new AppError("Chỉ cho phép upload ảnh, PDF, DOC hoặc DOCX", 400));
  }

  return cb(null, true);
};

const uploadExcel = multer({
  storage: buildStorage(TREE_IMPORT_DIR),
  fileFilter: excelFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});

const uploadIncidentImages = multer({
  storage: buildStorage(INCIDENT_DIR),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 10
  }
});

const uploadIncidentReply = multer({
  storage: buildStorage(INCIDENT_REPLY_DIR),
  fileFilter: mixedIncidentFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5
  }
});

const uploadPlanFiles = multer({
  storage: buildStorage(PLAN_DIR),
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5
  }
});

const uploadPlanApprovalFiles = multer({
  storage: buildStorage(PLAN_APPROVAL_DIR),
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 3
  }
});

const uploadAssignmentFiles = multer({
  storage: buildStorage(ASSIGNMENT_DIR),
  fileFilter: assignmentFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 20
  }
});

const uploadAcceptanceRecordFiles = multer({
  storage: buildStorage(ACCEPTANCE_RECORD_DIR),
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1
  }
});

module.exports = {
  uploadExcel,
  uploadIncidentImages,
  uploadIncidentReply,
  uploadPlanFiles,
  uploadPlanApprovalFiles,
  uploadAssignmentFiles,
  uploadAcceptanceRecordFiles
};