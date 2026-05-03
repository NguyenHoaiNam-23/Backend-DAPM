const { getConnection, sql } = require("../../database/connection");
const { buildCode } = require("../../common/utils/id.util");

const generateBeforeImageId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaAnhTruoc, 4, 20) AS INT)) AS MaxNumber
    FROM AnhTruocPhanCong
    WHERE MaAnhTruoc LIKE 'ATP%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("ATP", maxNumber + 1, 3);
};

const generateAfterImageId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaAnhSau, 4, 20) AS INT)) AS MaxNumber
    FROM AnhSauPhanCong
    WHERE MaAnhSau LIKE 'ASP%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("ASP", maxNumber + 1, 3);
};

const createBeforeImage = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaAnhTruoc", sql.VarChar, data.maAnhTruoc)
    .input("MaChiTietPhanCong", sql.VarChar, data.maChiTiet)
    .input("DuongDanAnh", sql.VarChar, data.duongDanAnh)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .query(`
      INSERT INTO AnhTruocPhanCong (
        MaAnhTruoc,
        MaChiTietPhanCong,
        DuongDanAnh,
        MoTa,
        NgayUpload
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaAnhTruoc,
        @MaChiTietPhanCong,
        @DuongDanAnh,
        @MoTa,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const createAfterImage = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaAnhSau", sql.VarChar, data.maAnhSau)
    .input("MaChiTietPhanCong", sql.VarChar, data.maChiTiet)
    .input("DuongDanAnh", sql.VarChar, data.duongDanAnh)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .query(`
      INSERT INTO AnhSauPhanCong (
        MaAnhSau,
        MaChiTietPhanCong,
        DuongDanAnh,
        MoTa,
        NgayUpload
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaAnhSau,
        @MaChiTietPhanCong,
        @DuongDanAnh,
        @MoTa,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const findBeforeImagesByDetailId = async (maChiTiet) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTietPhanCong", sql.VarChar, maChiTiet)
    .query(`
      SELECT
        MaAnhTruoc,
        MaChiTietPhanCong,
        DuongDanAnh,
        MoTa,
        NgayUpload
      FROM AnhTruocPhanCong
      WHERE MaChiTietPhanCong = @MaChiTietPhanCong
      ORDER BY NgayUpload ASC
    `);

  return result.recordset;
};

const findAfterImagesByDetailId = async (maChiTiet) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTietPhanCong", sql.VarChar, maChiTiet)
    .query(`
      SELECT
        MaAnhSau,
        MaChiTietPhanCong,
        DuongDanAnh,
        MoTa,
        NgayUpload
      FROM AnhSauPhanCong
      WHERE MaChiTietPhanCong = @MaChiTietPhanCong
      ORDER BY NgayUpload ASC
    `);

  return result.recordset;
};

module.exports = {
  generateBeforeImageId,
  generateAfterImageId,
  createBeforeImage,
  createAfterImage,
  findBeforeImagesByDetailId,
  findAfterImagesByDetailId
};