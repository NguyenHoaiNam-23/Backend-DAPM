const { getConnection, sql } = require("../../database/connection");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã chi tiết báo cáo: CTBC001...
 */
const generateIncidentDetailId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaChiTietBaoCao, 5, 20) AS INT)) AS MaxNumber
    FROM ChiTietBaoCao
    WHERE MaChiTietBaoCao LIKE 'CTBC%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("CTBC", maxNumber + 1, 3);
};

/**
 * Tạo một chi tiết báo cáo.
 *
 * Lưu ý:
 * SQL hiện đang có cột tên tiếng Việt: MoTaTìnhTrang.
 */
const createIncidentDetail = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaChiTietBaoCao", sql.VarChar, data.maChiTietBaoCao)
    .input("MaBaoCao", sql.VarChar, data.maBaoCao)
    .input("MaCay", sql.VarChar, data.maCay)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MoTaTinhTrang", sql.NVarChar, data.moTaTinhTrang || null)
    .input("MucDoNguyHiem", sql.NVarChar, data.mucDoNguyHiem)
    .input("DaXuLy", sql.Bit, data.daXuLy || false)
    .query(`
      INSERT INTO ChiTietBaoCao (
        MaChiTietBaoCao,
        MaBaoCao,
        MaCay,
        MaTuyenDuong,
        MaXaPhuong,
        MoTaTìnhTrang,
        MucDoNguyHiem,
        DaXuLy
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaChiTietBaoCao,
        @MaBaoCao,
        @MaCay,
        @MaTuyenDuong,
        @MaXaPhuong,
        @MoTaTinhTrang,
        @MucDoNguyHiem,
        @DaXuLy
      )
    `);

  return result.recordset[0];
};

/**
 * Lấy danh sách chi tiết báo cáo theo MaBaoCao.
 */
const findDetailsByIncidentId = async (maBaoCao) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .query(`
      SELECT
        CT.MaChiTietBaoCao,
        CT.MaBaoCao,
        CT.MaCay,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        DMC.TenCayTrong,
        CT.MaTuyenDuong,
        TD.TenTuyenDuong,
        CT.MaXaPhuong,
        XP.TenXaPhuong,
        CT.MoTaTìnhTrang,
        CT.MucDoNguyHiem,
        CT.DaXuLy
      FROM ChiTietBaoCao CT
      LEFT JOIN CayXanh CX ON CX.MaCay = CT.MaCay
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CT.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CT.MaXaPhuong
      WHERE CT.MaBaoCao = @MaBaoCao
      ORDER BY
        CASE CT.MucDoNguyHiem
          WHEN N'Khẩn cấp' THEN 1
          WHEN N'Cao' THEN 2
          WHEN N'Trung bình' THEN 3
          WHEN N'Thấp' THEN 4
          ELSE 5
        END
    `);

  return result.recordset;
};

/**
 * Đánh dấu toàn bộ chi tiết báo cáo đã xử lý.
 */
const markDetailsAsResolved = async (maBaoCao) => {
  const pool = await getConnection();

  await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .query(`
      UPDATE ChiTietBaoCao
      SET DaXuLy = 1
      WHERE MaBaoCao = @MaBaoCao
    `);

  return true;
};

module.exports = {
  generateIncidentDetailId,
  createIncidentDetail,
  findDetailsByIncidentId,
  markDetailsAsResolved
};