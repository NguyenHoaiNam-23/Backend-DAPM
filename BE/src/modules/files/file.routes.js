const express = require("express");

const asyncHandler = require("../../common/middlewares/asyncHandler");
const fileController = require("./file.controller");

const router = express.Router();

router.get(
  "/:filename",
  asyncHandler(fileController.getFile)
);

module.exports = router;
