const express = require("express");

const asyncHandler = require("../../common/middlewares/asyncHandler");
const treeTypeController = require("./treeType.controller");

const router = express.Router();

router.get("/", asyncHandler(treeTypeController.getTreeTypes));
router.get("/:maDMCay", asyncHandler(treeTypeController.getTreeTypeById));
router.post("/", asyncHandler(treeTypeController.createTreeType));
router.put("/:maDMCay", asyncHandler(treeTypeController.updateTreeType));
router.delete("/:maDMCay", asyncHandler(treeTypeController.deleteTreeType));

module.exports = router;
