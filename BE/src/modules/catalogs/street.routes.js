const express = require("express");

const asyncHandler = require("../../common/middlewares/asyncHandler");
const streetController = require("./street.controller");

const router = express.Router();

router.get("/", asyncHandler(streetController.getStreets));
router.get("/:maTuyenDuong", asyncHandler(streetController.getStreetById));
router.post("/", asyncHandler(streetController.createStreet));
router.put("/:maTuyenDuong", asyncHandler(streetController.updateStreet));
router.delete("/:maTuyenDuong", asyncHandler(streetController.deleteStreet));

module.exports = router;
