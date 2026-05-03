const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã hồ sơ nghiệm thu: HS001, HS002...
 */
const generateAcceptanceRecordId = async () => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaHoSo, 3, 20) AS INT)) AS MaxNumber
      FROM HoSoLuuTruNghiemThu
      WHERE MaHoSo LIKE 'HS%'
    `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("HS", maxNumber + 1, 3);
};

/**
 * Tìm loại công việc.
 */
const findWorkTypeById = async (maLoaiCongViec) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .query(`
      SELECT *
      FROM DanhMucCongViec
      WHERE MaLoaiCongViec = @MaLoaiCongViec
    `);

  return result.recordset[0] || null;
};

/**
 * Tìm xã phường.
 */
const findWardById = async (maXaPhuong) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .query(`
      SELECT *
      FROM XaPhuong
      WHERE MaXaPhuong = @MaXaPhuong
    `);

  return result.recordset[0] || null;
};

/**
 * Tìm tuyến đường.
 */
const findStreetById = async (maTuyenDuong) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .query(`
      SELECT *
      FROM TuyenDuong
      WHERE MaTuyenDuong = @MaTuyenDuong
    `);

  return result.recordset[0] || null;
};

/**
 * Tìm người dùng.
 */
const findUserById = async (maNguoiDung) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .query(`
      SELECT *
      FROM NguoiDung
      WHERE MaNguoiDung = @MaNguoiDung
    `);

  return result.recordset[0] || null;
};

/**
 * POST /api/v1/acceptance-records
 */
const createAcceptanceRecord = async (data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaHoSo", sql.VarChar, data.maHoSo)
    .input("MaLoaiCongViec", sql.VarChar, data.maLoaiCongViec)
    .input("TieuDe", sql.NVarChar, data.tieuDe)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .input("FilePDF", sql.VarChar, data.filePDF || null)
    .input("NguoiTao", sql.VarChar, data.nguoiTao || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong)
    .query(`
      INSERT INTO HoSoLuuTruNghiemThu (
        MaHoSo,
        MaLoaiCongViec,
        TieuDe,
        MoTa,
        FilePDF,
        NguoiTao,
        NgayTao,
        MaXaPhuong,
        MaTuyenDuong
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaHoSo,
        @MaLoaiCongViec,
        @TieuDe,
        @MoTa,
        @FilePDF,
        @NguoiTao,
        GETDATE(),
        @MaXaPhuong,
        @MaTuyenDuong
      )
    `);

  return result.recordset[0];
};

/**
 * GET /api/v1/acceptance-records
 */
const findAcceptanceRecords = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || null;
  const maLoaiCongViec = queryParams.maLoaiCongViec || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;
  const nguoiTao = queryParams.nguoiTao || null;
  const tuNgay = queryParams.tuNgay || null;
  const denNgay = queryParams.denNgay || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("NguoiTao", sql.VarChar, nguoiTao)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        HS.MaHoSo,
        HS.MaLoaiCongViec,
        DMCV.TenCongViec,
        HS.TieuDe,
        HS.MoTa,
        HS.FilePDF,
        HS.NguoiTao,
        NDTao.HoTen AS TenNguoiTao,
        HS.NgayTao,
        HS.NguoiCapNhat,
        NDCapNhat.HoTen AS TenNguoiCapNhat,
        HS.NgayCapNhat,
        HS.MaXaPhuong,
        XP.TenXaPhuong,
        HS.MaTuyenDuong,
        TD.TenTuyenDuong
      FROM HoSoLuuTruNghiemThu HS
      LEFT JOIN DanhMucCongViec DMCV ON DMCV.MaLoaiCongViec = HS.MaLoaiCongViec
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = HS.MaXaPhuong
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = HS.MaTuyenDuong
      LEFT JOIN NguoiDung NDTao ON NDTao.MaNguoiDung = HS.NguoiTao
      LEFT JOIN NguoiDung NDCapNhat ON NDCapNhat.MaNguoiDung = HS.NguoiCapNhat
      WHERE
        (@Keyword IS NULL OR HS.MaHoSo LIKE @Keyword OR HS.TieuDe LIKE @Keyword OR HS.MoTa LIKE @Keyword)
        AND (@MaLoaiCongViec IS NULL OR HS.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@MaXaPhuong IS NULL OR HS.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR HS.MaTuyenDuong = @MaTuyenDuong)
        AND (@NguoiTao IS NULL OR HS.NguoiTao = @NguoiTao)
        AND (@TuNgay IS NULL OR HS.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR HS.NgayTao <= @DenNgay)
      ORDER BY HS.NgayTao DESC, HS.MaHoSo DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("NguoiTao", sql.VarChar, nguoiTao)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .query(`
      SELECT COUNT(1) AS Total
      FROM HoSoLuuTruNghiemThu HS
      WHERE
        (@Keyword IS NULL OR HS.MaHoSo LIKE @Keyword OR HS.TieuDe LIKE @Keyword OR HS.MoTa LIKE @Keyword)
        AND (@MaLoaiCongViec IS NULL OR HS.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@MaXaPhuong IS NULL OR HS.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR HS.MaTuyenDuong = @MaTuyenDuong)
        AND (@NguoiTao IS NULL OR HS.NguoiTao = @NguoiTao)
        AND (@TuNgay IS NULL OR HS.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR HS.NgayTao <= @DenNgay)
    `);

  const total = countResult.recordset[0].Total;

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({
      page,
      limit,
      total
    })
  };
};

/**
 * GET /api/v1/acceptance-records/:maHoSo
 */
const findAcceptanceRecordById = async (maHoSo) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaHoSo", sql.VarChar, maHoSo)
    .query(`
      SELECT
        HS.MaHoSo,
        HS.MaLoaiCongViec,
        DMCV.TenCongViec,
        HS.TieuDe,
        HS.MoTa,
        HS.FilePDF,
        HS.NguoiTao,
        NDTao.HoTen AS TenNguoiTao,
        HS.NgayTao,
        HS.NguoiCapNhat,
        NDCapNhat.HoTen AS TenNguoiCapNhat,
        HS.NgayCapNhat,
        HS.MaXaPhuong,
        XP.TenXaPhuong,
        HS.MaTuyenDuong,
        TD.TenTuyenDuong
      FROM HoSoLuuTruNghiemThu HS
      LEFT JOIN DanhMucCongViec DMCV ON DMCV.MaLoaiCongViec = HS.MaLoaiCongViec
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = HS.MaXaPhuong
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = HS.MaTuyenDuong
      LEFT JOIN NguoiDung NDTao ON NDTao.MaNguoiDung = HS.NguoiTao
      LEFT JOIN NguoiDung NDCapNhat ON NDCapNhat.MaNguoiDung = HS.NguoiCapNhat
      WHERE HS.MaHoSo = @MaHoSo
    `);

  return result.recordset[0] || null;
};

/**
 * PUT /api/v1/acceptance-records/:maHoSo
 */
const updateAcceptanceRecord = async (maHoSo, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaHoSo", sql.VarChar, maHoSo)
    .input("MaLoaiCongViec", sql.VarChar, data.maLoaiCongViec || null)
    .input("TieuDe", sql.NVarChar, data.tieuDe || null)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .input("FilePDF", sql.VarChar, data.filePDF || null)
    .input("NguoiCapNhat", sql.VarChar, data.nguoiCapNhat || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .query(`
      UPDATE HoSoLuuTruNghiemThu
      SET
        MaLoaiCongViec = COALESCE(@MaLoaiCongViec, MaLoaiCongViec),
        TieuDe = COALESCE(@TieuDe, TieuDe),
        MoTa = COALESCE(@MoTa, MoTa),
        FilePDF = COALESCE(@FilePDF, FilePDF),
        NguoiCapNhat = COALESCE(@NguoiCapNhat, NguoiCapNhat),
        MaXaPhuong = COALESCE(@MaXaPhuong, MaXaPhuong),
        MaTuyenDuong = COALESCE(@MaTuyenDuong, MaTuyenDuong),
        NgayCapNhat = GETDATE()
      WHERE MaHoSo = @MaHoSo;

      SELECT *
      FROM HoSoLuuTruNghiemThu
      WHERE MaHoSo = @MaHoSo;
    `);

  return result.recordset[0];
};

/**
 * DELETE /api/v1/acceptance-records/:maHoSo
 */
const deleteAcceptanceRecord = async (maHoSo) => {
  const pool = await getConnection();

  await pool.request()
    .input("MaHoSo", sql.VarChar, maHoSo)
    .query(`
      DELETE FROM HoSoLuuTruNghiemThu
      WHERE MaHoSo = @MaHoSo
    `);

  return {
    maHoSo
  };
};

module.exports = {
  generateAcceptanceRecordId,
  findWorkTypeById,
  findWardById,
  findStreetById,
  findUserById,
  createAcceptanceRecord,
  findAcceptanceRecords,
  findAcceptanceRecordById,
  updateAcceptanceRecord,
  deleteAcceptanceRecord
};