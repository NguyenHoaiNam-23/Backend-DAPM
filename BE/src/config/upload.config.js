require("dotenv").config();
const path = require("path");

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || "src/uploads";
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 10);

module.exports = {
  UPLOAD_ROOT,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_MB * 1024 * 1024,

  TREE_IMPORT_DIR: path.join(UPLOAD_ROOT, "trees-import"),

  INCIDENT_DIR: path.join(UPLOAD_ROOT, "incidents"),
  INCIDENT_REPLY_DIR: path.join(UPLOAD_ROOT, "incidents", "replies"),

  PLAN_DIR: path.join(UPLOAD_ROOT, "plans"),
  PLAN_APPROVAL_DIR: path.join(UPLOAD_ROOT, "plans", "approvals"),

  ASSIGNMENT_DIR: path.join(UPLOAD_ROOT, "assignments"),
  ASSIGNMENT_BEFORE_DIR: path.join(UPLOAD_ROOT, "assignments", "before"),
  ASSIGNMENT_AFTER_DIR: path.join(UPLOAD_ROOT, "assignments", "after"),

  ACCEPTANCE_RECORD_DIR: path.join(UPLOAD_ROOT, "acceptance-records"),

  REPORT_DIR: path.join(UPLOAD_ROOT, "reports"),
  TEMP_DIR: path.join(UPLOAD_ROOT, "temp")
};