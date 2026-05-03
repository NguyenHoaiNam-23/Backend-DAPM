const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã kế hoạch: KH001, KH002...
 */
const generatePlanId = async () => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaKeHoach, 3, 20) AS INT)) AS MaxNumber
      FROM KeHoachCongViec
      WHERE MaKeHoach LIKE 'KH%'
    `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("KH", maxNumber + 1, 3);
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
 * GET /api/v1/plans
 */
const findPlans = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || queryParams.tieuDe || null;
  const trangThai = queryParams.trangThai || null;
  const maLoaiCongViec = queryParams.maLoaiCongViec || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const nguoiLap = queryParams.nguoiLap || queryParams.nguoiTao || null;
  const nguoiPheDuyet = queryParams.nguoiPheDuyet || queryParams.nguoiXuLy || null;
  const tuNgay = queryParams.tuNgay || null;
  const denNgay = queryParams.denNgay || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("NguoiLap", sql.VarChar, nguoiLap)
    .input("NguoiPheDuyet", sql.VarChar, nguoiPheDuyet)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        KH.MaKeHoach,
        KH.MaLoaiCongViec,
        DMCV.TenCongViec,
        KH.TieuDe,
        KH.MoTa,
        KH.TrangThai,
        KH.FilePDFKeHoach,
        KH.FilePDFDeNghiCapPhep,
        KH.FilePDFBoSungKeHoach,
        KH.NguoiLap,
        NDLap.HoTen AS TenNguoiLap,
        KH.NguoiPheDuyet,
        NDPheDuyet.HoTen AS TenNguoiPheDuyet,
        KH.YKienPheDuyet,
        KH.NgayPheDuyet,
        KH.MaTuyenDuong,
        TD.TenTuyenDuong,
        KH.MaXaPhuong,
        XP.TenXaPhuong,
        KH.NgayTao,
        KH.NgayCapNhat
      FROM KeHoachCongViec KH
      LEFT JOIN DanhMucCongViec DMCV ON DMCV.MaLoaiCongViec = KH.MaLoaiCongViec
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = KH.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = KH.MaXaPhuong
      LEFT JOIN NguoiDung NDLap ON NDLap.MaNguoiDung = KH.NguoiLap
      LEFT JOIN NguoiDung NDPheDuyet ON NDPheDuyet.MaNguoiDung = KH.NguoiPheDuyet
      WHERE
        (@Keyword IS NULL OR KH.TieuDe LIKE @Keyword OR KH.MaKeHoach LIKE @Keyword OR KH.MoTa LIKE @Keyword)
        AND (@TrangThai IS NULL OR KH.TrangThai = @TrangThai)
        AND (@MaLoaiCongViec IS NULL OR KH.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@MaTuyenDuong IS NULL OR KH.MaTuyenDuong = @MaTuyenDuong)
        AND (@MaXaPhuong IS NULL OR KH.MaXaPhuong = @MaXaPhuong)
        AND (@NguoiLap IS NULL OR KH.NguoiLap = @NguoiLap)
        AND (@NguoiPheDuyet IS NULL OR KH.NguoiPheDuyet = @NguoiPheDuyet)
        AND (@TuNgay IS NULL OR KH.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR KH.NgayTao <= @DenNgay)
      ORDER BY KH.NgayTao DESC, KH.MaKeHoach DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("NguoiLap", sql.VarChar, nguoiLap)
    .input("NguoiPheDuyet", sql.VarChar, nguoiPheDuyet)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .query(`
      SELECT COUNT(1) AS Total
      FROM KeHoachCongViec KH
      WHERE
        (@Keyword IS NULL OR KH.TieuDe LIKE @Keyword OR KH.MaKeHoach LIKE @Keyword OR KH.MoTa LIKE @Keyword)
        AND (@TrangThai IS NULL OR KH.TrangThai = @TrangThai)
        AND (@MaLoaiCongViec IS NULL OR KH.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@MaTuyenDuong IS NULL OR KH.MaTuyenDuong = @MaTuyenDuong)
        AND (@MaXaPhuong IS NULL OR KH.MaXaPhuong = @MaXaPhuong)
        AND (@NguoiLap IS NULL OR KH.NguoiLap = @NguoiLap)
        AND (@NguoiPheDuyet IS NULL OR KH.NguoiPheDuyet = @NguoiPheDuyet)
        AND (@TuNgay IS NULL OR KH.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR KH.NgayTao <= @DenNgay)
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
 * GET /api/v1/plans/:maKeHoach
 */
const findPlanById = async (maKeHoach) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, maKeHoach)
    .query(`
      SELECT
        KH.MaKeHoach,
        KH.MaLoaiCongViec,
        DMCV.TenCongViec,
        KH.TieuDe,
        KH.MoTa,
        KH.TrangThai,
        KH.FilePDFKeHoach,
        KH.FilePDFDeNghiCapPhep,
        KH.FilePDFBoSungKeHoach,
        KH.NguoiLap,
        NDLap.HoTen AS TenNguoiLap,
        KH.NguoiPheDuyet,
        NDPheDuyet.HoTen AS TenNguoiPheDuyet,
        KH.YKienPheDuyet,
        KH.NgayPheDuyet,
        KH.MaTuyenDuong,
        TD.TenTuyenDuong,
        KH.MaXaPhuong,
        XP.TenXaPhuong,
        KH.NgayTao,
        KH.NgayCapNhat
      FROM KeHoachCongViec KH
      LEFT JOIN DanhMucCongViec DMCV ON DMCV.MaLoaiCongViec = KH.MaLoaiCongViec
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = KH.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = KH.MaXaPhuong
      LEFT JOIN NguoiDung NDLap ON NDLap.MaNguoiDung = KH.NguoiLap
      LEFT JOIN NguoiDung NDPheDuyet ON NDPheDuyet.MaNguoiDung = KH.NguoiPheDuyet
      WHERE KH.MaKeHoach = @MaKeHoach
    `);

  return result.recordset[0] || null;
};

/**
 * POST /api/v1/plans
 */
const createPlan = async (data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, data.maKeHoach)
    .input("MaLoaiCongViec", sql.VarChar, data.maLoaiCongViec)
    .input("TieuDe", sql.NVarChar, data.tieuDe)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .input("TrangThai", sql.NVarChar, data.trangThai || "Đang chờ duyệt")
    .input("FilePDFKeHoach", sql.VarChar, data.filePDFKeHoach || null)
    .input("FilePDFDeNghiCapPhep", sql.VarChar, data.filePDFDeNghiCapPhep || null)
    .input("FilePDFBoSungKeHoach", sql.VarChar, data.filePDFBoSungKeHoach || null)
    .input("NguoiLap", sql.VarChar, data.nguoiLap || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .query(`
      INSERT INTO KeHoachCongViec (
        MaKeHoach,
        MaLoaiCongViec,
        TieuDe,
        MoTa,
        TrangThai,
        FilePDFKeHoach,
        FilePDFDeNghiCapPhep,
        FilePDFBoSungKeHoach,
        NguoiLap,
        MaTuyenDuong,
        MaXaPhuong,
        NgayTao
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaKeHoach,
        @MaLoaiCongViec,
        @TieuDe,
        @MoTa,
        @TrangThai,
        @FilePDFKeHoach,
        @FilePDFDeNghiCapPhep,
        @FilePDFBoSungKeHoach,
        @NguoiLap,
        @MaTuyenDuong,
        @MaXaPhuong,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

/**
 * PUT /api/v1/plans/:maKeHoach
 */
const updatePlan = async (maKeHoach, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, maKeHoach)
    .input("MaLoaiCongViec", sql.VarChar, data.maLoaiCongViec || null)
    .input("TieuDe", sql.NVarChar, data.tieuDe || null)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .input("FilePDFKeHoach", sql.VarChar, data.filePDFKeHoach || null)
    .input("FilePDFDeNghiCapPhep", sql.VarChar, data.filePDFDeNghiCapPhep || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .query(`
      UPDATE KeHoachCongViec
      SET
        MaLoaiCongViec = COALESCE(@MaLoaiCongViec, MaLoaiCongViec),
        TieuDe = COALESCE(@TieuDe, TieuDe),
        MoTa = COALESCE(@MoTa, MoTa),
        FilePDFKeHoach = COALESCE(@FilePDFKeHoach, FilePDFKeHoach),
        FilePDFDeNghiCapPhep = COALESCE(@FilePDFDeNghiCapPhep, FilePDFDeNghiCapPhep),
        MaTuyenDuong = COALESCE(@MaTuyenDuong, MaTuyenDuong),
        MaXaPhuong = COALESCE(@MaXaPhuong, MaXaPhuong),
        NgayCapNhat = GETDATE()
      WHERE MaKeHoach = @MaKeHoach;

      SELECT *
      FROM KeHoachCongViec
      WHERE MaKeHoach = @MaKeHoach;
    `);

  return result.recordset[0];
};

/**
 * Hủy kế hoạch.
 */
const cancelPlan = async (maKeHoach, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, maKeHoach)
    .input("LyDoHuy", sql.NVarChar, data.lyDoHuy)
    .query(`
      UPDATE KeHoachCongViec
      SET
        TrangThai = N'Đã bị từ chối',
        YKienPheDuyet = CONCAT(N'[Hủy kế hoạch] ', @LyDoHuy),
        NgayCapNhat = GETDATE()
      WHERE MaKeHoach = @MaKeHoach;

      SELECT *
      FROM KeHoachCongViec
      WHERE MaKeHoach = @MaKeHoach;
    `);

  return result.recordset[0];
};

/**
 * Cập nhật trạng thái/phê duyệt kế hoạch.
 */
const updatePlanStatus = async (maKeHoach, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, maKeHoach)
    .input("TrangThai", sql.NVarChar, data.trangThai)
    .input("YKienPheDuyet", sql.NVarChar, data.yKienPheDuyet || null)
    .input("FilePDFBoSungKeHoach", sql.VarChar, data.filePDFBoSungKeHoach || null)
    .input("NguoiPheDuyet", sql.VarChar, data.nguoiPheDuyet || null)
    .query(`
      UPDATE KeHoachCongViec
      SET
        TrangThai = @TrangThai,
        YKienPheDuyet = COALESCE(@YKienPheDuyet, YKienPheDuyet),
        FilePDFBoSungKeHoach = COALESCE(@FilePDFBoSungKeHoach, FilePDFBoSungKeHoach),
        NguoiPheDuyet = COALESCE(@NguoiPheDuyet, NguoiPheDuyet),
        NgayPheDuyet = CASE
          WHEN @TrangThai IN (N'Đã phê duyệt', N'Đã bị từ chối') THEN GETDATE()
          ELSE NgayPheDuyet
        END,
        NgayCapNhat = GETDATE()
      WHERE MaKeHoach = @MaKeHoach;

      SELECT *
      FROM KeHoachCongViec
      WHERE MaKeHoach = @MaKeHoach;
    `);

  return result.recordset[0];
};

module.exports = {
  generatePlanId,
  findWorkTypeById,
  findStreetById,
  findWardById,
  findUserById,

  findPlans,
  findPlanById,
  createPlan,
  updatePlan,
  cancelPlan,
  updatePlanStatus
};