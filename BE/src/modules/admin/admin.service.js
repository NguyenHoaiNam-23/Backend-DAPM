const adminRepository = require("./admin.repository");

const getDashboard = async () => {
  const [
    summary,
    userRoleSummary,
    recentActivities
  ] = await Promise.all([
    adminRepository.getDashboardSummary(),
    adminRepository.getUserRoleSummary(),
    adminRepository.getRecentActivities()
  ]);

  return {
    summary,
    userRoleSummary,
    recentActivities
  };
};

module.exports = {
  getDashboard
};