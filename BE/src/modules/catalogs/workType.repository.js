const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateWorkTypeId = async () => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("PrefixLike", sql.VarChar, "CV%")
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaLoaiCongViec, 3, 20) AS INT)) AS MaxNumber
      FROM DanhMucCongViec
      WHERE MaLoaiCongViec LIKE @PrefixLike
    `);

  return buildCode("CV", (result.recordset[0]?.MaxNumber || 0) + 1, 2);
};

const findWorkTypes = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);
  const keyword = queryParams.keyword || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        MaLoaiCongViec,
        TenCongViec,
        MoTaCV
      FROM DanhMucCongViec
      WHERE (@Keyword IS NULL OR TenCongViec LIKE @Keyword OR MaLoaiCongViec LIKE @Keyword)
      ORDER BY MaLoaiCongViec DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .query(`
      SELECT COUNT(1) AS Total
      FROM DanhMucCongViec
      WHERE (@Keyword IS NULL OR TenCongViec LIKE @Keyword OR MaLoaiCongViec LIKE @Keyword)
    `);

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total: countResult.recordset[0].Total })
  };
};

const findWorkTypeById = async (maLoaiCongViec) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .query(`
      SELECT
        MaLoaiCongViec,
        TenCongViec,
        MoTaCV
      FROM DanhMucCongViec
      WHERE MaLoaiCongViec = @MaLoaiCongViec
    `);

  return result.recordset[0] || null;
};

const createWorkType = async (data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, data.maLoaiCongViec)
    .input("TenCongViec", sql.NVarChar, data.tenCongViec)
    .input("MoTaCV", sql.NVarChar, data.moTaCV ?? null)
    .query(`
      INSERT INTO DanhMucCongViec (
        MaLoaiCongViec,
        TenCongViec,
        MoTaCV
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaLoaiCongViec,
        @TenCongViec,
        @MoTaCV
      )
    `);

  return result.recordset[0];
};

const updateWorkType = async (maLoaiCongViec, data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("TenCongViec", sql.NVarChar, data.tenCongViec ?? null)
    .input("MoTaCV", sql.NVarChar, data.moTaCV ?? null)
    .query(`
      UPDATE DanhMucCongViec
      SET
        TenCongViec = COALESCE(@TenCongViec, TenCongViec),
        MoTaCV = COALESCE(@MoTaCV, MoTaCV)
      OUTPUT INSERTED.*
      WHERE MaLoaiCongViec = @MaLoaiCongViec
    `);

  return result.recordset[0];
};

const deleteWorkType = async (maLoaiCongViec) => {
  const pool = await getConnection();
  await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .query(`
      DELETE FROM DanhMucCongViec
      WHERE MaLoaiCongViec = @MaLoaiCongViec
    `);

  return { maLoaiCongViec };
};

const isWorkTypeUsed = async (maLoaiCongViec) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .query(`
      SELECT
        (
          SELECT COUNT(1) FROM KeHoachCongViec WHERE MaLoaiCongViec = @MaLoaiCongViec
        )
        +
        (
          SELECT COUNT(1) FROM HoSoLuuTruNghiemThu WHERE MaLoaiCongViec = @MaLoaiCongViec
        ) AS Total
    `);

  return result.recordset[0].Total > 0;
};

module.exports = {
  generateWorkTypeId,
  findWorkTypes,
  findWorkTypeById,
  createWorkType,
  updateWorkType,
  deleteWorkType,
  isWorkTypeUsed
};
