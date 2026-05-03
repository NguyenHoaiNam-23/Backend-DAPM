const express = require("express");

const treeTypeRoutes = require("./treeType.routes");
const workTypeRoutes = require("./workType.routes");
const wardRoutes = require("./ward.routes");
const streetRoutes = require("./street.routes");

const router = express.Router();

router.use("/tree-types", treeTypeRoutes);
router.use("/work-types", workTypeRoutes);
router.use("/wards", wardRoutes);
router.use("/streets", streetRoutes);

module.exports = router;
