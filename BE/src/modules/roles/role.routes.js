const express = require("express");

const roleController = require("./role.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { authenticate, authorize } = require("../../common/middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "CANBO"),
  asyncHandler(roleController.getRoles)
);

router.get(
  "/:maVaiTro",
  authenticate,
  authorize("ADMIN", "CANBO"),
  asyncHandler(roleController.getRoleById)
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(roleController.createRole)
);

router.put(
  "/:maVaiTro",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(roleController.updateRole)
);

router.delete(
  "/:maVaiTro",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(roleController.deleteRole)
);

module.exports = router;