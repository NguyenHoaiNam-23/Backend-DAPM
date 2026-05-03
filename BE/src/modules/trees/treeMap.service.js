const treeRepository = require("./tree.repository");

/**
 * Service riêng cho bản đồ.
 *
 * Lý do tách:
 * - API map cần trả dữ liệu nhẹ.
 * - Không trả toàn bộ hồ sơ cây.
 * - Có thể dùng bbox để tối ưu hiệu năng khi bản đồ zoom/pan.
 */
const getTreesForMap = async (query) => {
  return treeRepository.findTreesForMap(query);
};

module.exports = {
  getTreesForMap
};