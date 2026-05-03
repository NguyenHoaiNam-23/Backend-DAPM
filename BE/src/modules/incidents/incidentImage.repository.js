const { getConnection, sql } = require("../../database/connection");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã hình ảnh: HA001, HA002...
 */
const generateImageId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaHinhAnh, 3, 20) AS INT)) AS MaxNumber
    FROM HinhAnhBaoCao
    WHERE MaHinhAnh LIKE 'HA%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("HA", maxNumber + 1, 3);
};

/**
 * Alias để tương thích với incident.service.js nếu còn gọi tên cũ.
 */
const generateIncidentImageId = generateImageId;

/**
 * Thêm hình ảnh cho chi tiết báo cáo.
 *
 * Bảng HinhAnhBaoCao:
 * - MaHinhAnh
 * - MaChiTietBaoCao
 * - DuongDanHinh
 * - MoTaHinh
 * - NgayUpload
 */
const createIncidentImage = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaHinhAnh", sql.VarChar, data.maHinhAnh)
    .input("MaChiTietBaoCao", sql.VarChar, data.maChiTietBaoCao)
    .input("DuongDanHinh", sql.VarChar, data.duongDanHinh)
    .input("MoTaHinh", sql.NVarChar, data.moTaHinh || null)
    .query(`
      INSERT INTO HinhAnhBaoCao (
        MaHinhAnh,
        MaChiTietBaoCao,
        DuongDanHinh,
        MoTaHinh,
        NgayUpload
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaHinhAnh,
        @MaChiTietBaoCao,
        @DuongDanHinh,
        @MoTaHinh,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

/**
 * Lấy hình ảnh theo mã chi tiết báo cáo.
 */
const findImagesByDetailId = async (maChiTietBaoCao) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTietBaoCao", sql.VarChar, maChiTietBaoCao)
    .query(`
      SELECT
        HA.MaHinhAnh,
        HA.MaChiTietBaoCao,
        HA.DuongDanHinh,
        HA.MoTaHinh,
        HA.NgayUpload
      FROM HinhAnhBaoCao HA
      WHERE HA.MaChiTietBaoCao = @MaChiTietBaoCao
      ORDER BY HA.NgayUpload ASC
    `);

  return result.recordset;
};

/**
 * Lấy hình ảnh theo mã báo cáo.
 *
 * HinhAnhBaoCao không có MaBaoCao,
 * nên phải JOIN qua ChiTietBaoCao.
 */
const findImagesByReportId = async (maBaoCao) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .query(`
      SELECT
        HA.MaHinhAnh,
        HA.MaChiTietBaoCao,
        CT.MaBaoCao,
        HA.DuongDanHinh,
        HA.MoTaHinh,
        HA.NgayUpload
      FROM HinhAnhBaoCao HA
      INNER JOIN ChiTietBaoCao CT
        ON CT.MaChiTietBaoCao = HA.MaChiTietBaoCao
      WHERE CT.MaBaoCao = @MaBaoCao
      ORDER BY HA.NgayUpload ASC
    `);

  return result.recordset;
};

/**
 * Alias để tương thích với incident.service.js nếu còn gọi tên cũ.
 */
const findImagesByIncidentId = findImagesByReportId;

module.exports = {
  generateImageId,
  generateIncidentImageId,
  createIncidentImage,
  findImagesByDetailId,
  findImagesByReportId,
  findImagesByIncidentId
};