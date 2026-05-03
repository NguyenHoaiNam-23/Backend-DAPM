const express = require("express");

const asyncHandler = require("../../common/middlewares/asyncHandler");
const wardController = require("./ward.controller");

const router = express.Router();

router.get("/", asyncHandler(wardController.getWards));
router.get("/:maXaPhuong", asyncHandler(wardController.getWardById));
router.post("/", asyncHandler(wardController.createWard));
router.put("/:maXaPhuong", asyncHandler(wardController.updateWard));
router.delete("/:maXaPhuong", asyncHandler(wardController.deleteWard));

module.exports = router;
