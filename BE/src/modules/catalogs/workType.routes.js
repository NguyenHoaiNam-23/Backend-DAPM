const express = require("express");

const asyncHandler = require("../../common/middlewares/asyncHandler");
const workTypeController = require("./workType.controller");

const router = express.Router();

router.get("/", asyncHandler(workTypeController.getWorkTypes));
router.get("/:maLoaiCongViec", asyncHandler(workTypeController.getWorkTypeById));
router.post("/", asyncHandler(workTypeController.createWorkType));
router.put("/:maLoaiCongViec", asyncHandler(workTypeController.updateWorkType));
router.delete("/:maLoaiCongViec", asyncHandler(workTypeController.deleteWorkType));

module.exports = router;
