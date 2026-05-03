const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const adminRoutes = require("../modules/admin/admin.routes");

const catalogRoutes = require("../modules/catalogs/catalog.routes");
const treeRoutes = require("../modules/trees/tree.routes");
const incidentRoutes = require("../modules/incidents/incident.routes");
const fieldReportRoutes = require("../modules/field-reports/fieldReport.routes");
const planRoutes = require("../modules/plans/plan.routes");
const assignmentRoutes = require("../modules/assignments/assignment.routes");
const acceptanceRecordRoutes = require("../modules/acceptance-records/acceptanceRecord.routes");
const statisticsRoutes = require("../modules/statistics/statistics.routes");
const reportRoutes = require("../modules/reports/report.routes");
const roleRoutes = require("../modules/roles/role.routes");
const fileRoutes = require("../modules/files/file.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  return res.json({
    success: true,
    message: "Backend API is running",
    data: {
      service: "Green Tree Management BE"
    }
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);

router.use("/catalogs", catalogRoutes);
router.use("/trees", treeRoutes);
router.use("/incidents", incidentRoutes);
router.use("/field-reports", fieldReportRoutes);
router.use("/plans", planRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/acceptance-records", acceptanceRecordRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/reports", reportRoutes);
router.use("/roles", roleRoutes);
router.use("/files", fileRoutes);

module.exports = router;
