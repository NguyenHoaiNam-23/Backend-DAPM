const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateStreetId = async () => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("PrefixLike", sql.VarChar, "D%")
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaTuyenDuong, 2, 20) AS INT)) AS MaxNumber
      FROM TuyenDuong
      WHERE MaTuyenDuong LIKE @PrefixLike
    `);

  return buildCode("D", (result.recordset[0]?.MaxNumber || 0) + 1, 2);
};

const findStreets = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);
  const keyword = queryParams.keyword || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const loaiDuong = queryParams.loaiDuong || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("LoaiDuong", sql.NVarChar, loaiDuong)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        TD.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        TD.MaXaPhuong,
        XP.TenXaPhuong
      FROM TuyenDuong TD
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = TD.MaXaPhuong
      WHERE
        (@Keyword IS NULL OR TD.TenTuyenDuong LIKE @Keyword OR TD.MaTuyenDuong LIKE @Keyword)
        AND (@MaXaPhuong IS NULL OR TD.MaXaPhuong = @MaXaPhuong)
        AND (@LoaiDuong IS NULL OR TD.LoaiDuong = @LoaiDuong)
      ORDER BY TD.MaTuyenDuong ASC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("LoaiDuong", sql.NVarChar, loaiDuong)
    .query(`
      SELECT COUNT(1) AS Total
      FROM TuyenDuong TD
      WHERE
        (@Keyword IS NULL OR TD.TenTuyenDuong LIKE @Keyword OR TD.MaTuyenDuong LIKE @Keyword)
        AND (@MaXaPhuong IS NULL OR TD.MaXaPhuong = @MaXaPhuong)
        AND (@LoaiDuong IS NULL OR TD.LoaiDuong = @LoaiDuong)
    `);

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total: countResult.recordset[0].Total })
  };
};

const findStreetById = async (maTuyenDuong) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .query(`
      SELECT
        TD.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        TD.MaXaPhuong,
        XP.TenXaPhuong
      FROM TuyenDuong TD
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = TD.MaXaPhuong
      WHERE TD.MaTuyenDuong = @MaTuyenDuong
    `);

  return result.recordset[0] || null;
};

const createStreet = async (data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong)
    .input("TenTuyenDuong", sql.NVarChar, data.tenTuyenDuong)
    .input("LoaiDuong", sql.NVarChar, data.loaiDuong ?? null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .query(`
      INSERT INTO TuyenDuong (
        MaTuyenDuong,
        TenTuyenDuong,
        LoaiDuong,
        MaXaPhuong
      )
      VALUES (
        @MaTuyenDuong,
        @TenTuyenDuong,
        @LoaiDuong,
        @MaXaPhuong
      );

      SELECT
        TD.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        TD.MaXaPhuong,
        XP.TenXaPhuong
      FROM TuyenDuong TD
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = TD.MaXaPhuong
      WHERE TD.MaTuyenDuong = @MaTuyenDuong;
    `);

  return result.recordset[0];
};

const updateStreet = async (maTuyenDuong, data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("TenTuyenDuong", sql.NVarChar, data.tenTuyenDuong ?? null)
    .input("LoaiDuong", sql.NVarChar, data.loaiDuong ?? null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong ?? null)
    .query(`
      UPDATE TuyenDuong
      SET
        TenTuyenDuong = COALESCE(@TenTuyenDuong, TenTuyenDuong),
        LoaiDuong = COALESCE(@LoaiDuong, LoaiDuong),
        MaXaPhuong = COALESCE(@MaXaPhuong, MaXaPhuong)
      WHERE MaTuyenDuong = @MaTuyenDuong;

      SELECT
        TD.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        TD.MaXaPhuong,
        XP.TenXaPhuong
      FROM TuyenDuong TD
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = TD.MaXaPhuong
      WHERE TD.MaTuyenDuong = @MaTuyenDuong;
    `);

  return result.recordset[0];
};

const deleteStreet = async (maTuyenDuong) => {
  const pool = await getConnection();
  await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .query(`
      DELETE FROM TuyenDuong
      WHERE MaTuyenDuong = @MaTuyenDuong
    `);

  return { maTuyenDuong };
};

const isStreetUsed = async (maTuyenDuong) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .query(`
      SELECT
        (
          SELECT COUNT(1) FROM CayXanh WHERE MaTuyenDuong = @MaTuyenDuong
        )
        +
        (
          SELECT COUNT(1) FROM NguoiDung WHERE MaTuyenDuong = @MaTuyenDuong
        )
        +
        (
          SELECT COUNT(1) FROM KeHoachCongViec WHERE MaTuyenDuong = @MaTuyenDuong
        )
        +
        (
          SELECT COUNT(1) FROM HoSoLuuTruNghiemThu WHERE MaTuyenDuong = @MaTuyenDuong
        ) AS Total
    `);

  return result.recordset[0].Total > 0;
};

module.exports = {
  generateStreetId,
  findStreets,
  findStreetById,
  createStreet,
  updateStreet,
  deleteStreet,
  isStreetUsed
};
