const express = require("express");

const authController = require("./auth.controller");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const { authenticate } = require("../../common/middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(authController.login)
);

router.post(
  "/register",
  asyncHandler(authController.register)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.getProfile)
);

router.get(
  "/profile",
  authenticate,
  asyncHandler(authController.getProfile)
);

router.put(
  "/profile",
  authenticate,
  asyncHandler(authController.updateProfile)
);

router.put(
  "/change-password",
  authenticate,
  asyncHandler(authController.changePassword)
);

router.put(
  "/password",
  authenticate,
  asyncHandler(authController.changePassword)
);

module.exports = router;