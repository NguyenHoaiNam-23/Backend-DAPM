const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateWardId = async () => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("PrefixLike", sql.VarChar, "P%")
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaXaPhuong, 2, 20) AS INT)) AS MaxNumber
      FROM XaPhuong
      WHERE MaXaPhuong LIKE @PrefixLike
    `);

  return buildCode("P", (result.recordset[0]?.MaxNumber || 0) + 1, 2);
};

const findWards = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);
  const keyword = queryParams.keyword || null;
  const loaiDanhMuc = queryParams.loaiDanhMuc || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("LoaiDanhMuc", sql.NVarChar, loaiDanhMuc)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        MaXaPhuong,
        MaHanhChinh,
        TenXaPhuong,
        LoaiDanhMuc
      FROM XaPhuong
      WHERE
        (@Keyword IS NULL OR TenXaPhuong LIKE @Keyword OR MaXaPhuong LIKE @Keyword)
        AND (@LoaiDanhMuc IS NULL OR LoaiDanhMuc = @LoaiDanhMuc)
      ORDER BY MaXaPhuong ASC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("LoaiDanhMuc", sql.NVarChar, loaiDanhMuc)
    .query(`
      SELECT COUNT(1) AS Total
      FROM XaPhuong
      WHERE
        (@Keyword IS NULL OR TenXaPhuong LIKE @Keyword OR MaXaPhuong LIKE @Keyword)
        AND (@LoaiDanhMuc IS NULL OR LoaiDanhMuc = @LoaiDanhMuc)
    `);

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total: countResult.recordset[0].Total })
  };
};

const findWardById = async (maXaPhuong) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .query(`
      SELECT
        MaXaPhuong,
        MaHanhChinh,
        TenXaPhuong,
        LoaiDanhMuc
      FROM XaPhuong
      WHERE MaXaPhuong = @MaXaPhuong
    `);

  return result.recordset[0] || null;
};

const createWard = async (data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .input("MaHanhChinh", sql.Int, data.maHanhChinh ?? null)
    .input("TenXaPhuong", sql.NVarChar, data.tenXaPhuong)
    .input("LoaiDanhMuc", sql.NVarChar, data.loaiDanhMuc ?? null)
    .query(`
      INSERT INTO XaPhuong (
        MaXaPhuong,
        MaHanhChinh,
        TenXaPhuong,
        LoaiDanhMuc
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaXaPhuong,
        @MaHanhChinh,
        @TenXaPhuong,
        @LoaiDanhMuc
      )
    `);

  return result.recordset[0];
};

const updateWard = async (maXaPhuong, data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaHanhChinh", sql.Int, data.maHanhChinh ?? null)
    .input("TenXaPhuong", sql.NVarChar, data.tenXaPhuong ?? null)
    .input("LoaiDanhMuc", sql.NVarChar, data.loaiDanhMuc ?? null)
    .query(`
      UPDATE XaPhuong
      SET
        MaHanhChinh = COALESCE(@MaHanhChinh, MaHanhChinh),
        TenXaPhuong = COALESCE(@TenXaPhuong, TenXaPhuong),
        LoaiDanhMuc = COALESCE(@LoaiDanhMuc, LoaiDanhMuc)
      OUTPUT INSERTED.*
      WHERE MaXaPhuong = @MaXaPhuong
    `);

  return result.recordset[0];
};

const deleteWard = async (maXaPhuong) => {
  const pool = await getConnection();
  await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .query(`
      DELETE FROM XaPhuong
      WHERE MaXaPhuong = @MaXaPhuong
    `);

  return { maXaPhuong };
};

const isWardUsed = async (maXaPhuong) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .query(`
      SELECT
        (
          SELECT COUNT(1) FROM TuyenDuong WHERE MaXaPhuong = @MaXaPhuong
        )
        +
        (
          SELECT COUNT(1) FROM CayXanh WHERE MaXaPhuong = @MaXaPhuong
        )
        +
        (
          SELECT COUNT(1) FROM NguoiDung WHERE MaXaPhuong = @MaXaPhuong
        )
        +
        (
          SELECT COUNT(1) FROM BaoCaoSuCo WHERE MaXaPhuong = @MaXaPhuong
        )
        +
        (
          SELECT COUNT(1) FROM HoSoLuuTruNghiemThu WHERE MaXaPhuong = @MaXaPhuong
        ) AS Total
    `);

  return result.recordset[0].Total > 0;
};

module.exports = {
  generateWardId,
  findWards,
  findWardById,
  createWard,
  updateWard,
  deleteWard,
  isWardUsed
};
