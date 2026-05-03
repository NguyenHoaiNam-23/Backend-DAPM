const express = require("express");

const userController = require("./user.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { authenticate, authorize } = require("../../common/middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "CANBO"),
  asyncHandler(userController.getUsers)
);

router.get(
  "/:maNguoiDung",
  authenticate,
  authorize("ADMIN", "CANBO"),
  asyncHandler(userController.getUserById)
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(userController.createUser)
);

router.put(
  "/:maNguoiDung",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(userController.updateUser)
);

router.put(
  "/:maNguoiDung/reset-password",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(userController.resetPassword)
);

router.delete(
  "/:maNguoiDung",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(userController.deleteUser)
);

module.exports = router;