const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã kế hoạch phân công: PC001, PC002...
 */
const generateAssignmentId = async () => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaKHPC, 3, 20) AS INT)) AS MaxNumber
      FROM KeHoachPhanCong
      WHERE MaKHPC LIKE 'PC%'
    `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("PC", maxNumber + 1, 3);
};

/**
 * Tìm kế hoạch công việc.
 */
const findPlanById = async (maKHCV) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKHCV", sql.VarChar, maKHCV)
    .query(`
      SELECT *
      FROM KeHoachCongViec
      WHERE MaKeHoach = @MaKHCV
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
 * Tạo kế hoạch phân công.
 */
const createAssignment = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaKHPC", sql.VarChar, data.maKHPC)
    .input("MaKHCV", sql.VarChar, data.maKHCV)
    .input("TieuDe", sql.NVarChar, data.tieuDe)
    .input("FilePDF", sql.VarChar, data.filePDF || null)
    .input("NguoiTao", sql.VarChar, data.nguoiTao || null)
    .input("TrangThaiNghiemThu", sql.NVarChar, data.trangThaiNghiemThu || "Chưa nghiệm thu")
    .query(`
      INSERT INTO KeHoachPhanCong (
        MaKHPC,
        MaKHCV,
        TieuDe,
        FilePDF,
        NguoiTao,
        TrangThaiNghiemThu,
        NgayTao
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaKHPC,
        @MaKHCV,
        @TieuDe,
        @FilePDF,
        @NguoiTao,
        @TrangThaiNghiemThu,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

/**
 * Lấy danh sách kế hoạch phân công.
 */
const findAssignments = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || null;
  const maKHCV = queryParams.maKHCV || null;
  const trangThaiNghiemThu = queryParams.trangThaiNghiemThu || null;
  const nguoiTao = queryParams.nguoiTao || null;
  const tuNgay = queryParams.tuNgay || null;
  const denNgay = queryParams.denNgay || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaKHCV", sql.VarChar, maKHCV)
    .input("TrangThaiNghiemThu", sql.NVarChar, trangThaiNghiemThu)
    .input("NguoiTao", sql.VarChar, nguoiTao)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        PC.MaKHPC,
        PC.MaKHCV,
        KH.TieuDe AS TieuDeKeHoach,
        PC.TieuDe,
        PC.FilePDF,
        PC.NguoiTao,
        NDTao.HoTen AS TenNguoiTao,
        PC.TrangThaiNghiemThu,
        PC.YKienNghiemThu,
        PC.NguoiNghiemThu,
        NDNghiemThu.HoTen AS TenNguoiNghiemThu,
        PC.NgayNghiemThu,
        PC.NgayTao,
        PC.NgayCapNhat,
        COUNT(CT.MaChiTiet) AS TongSoCongViec,
        SUM(CASE WHEN CT.XacNhanHoanTat = 1 THEN 1 ELSE 0 END) AS SoViecHoanTat,
        SUM(CASE WHEN CT.KetQuaNghiemThuChiTiet = N'Đạt' THEN 1 ELSE 0 END) AS SoViecDat,
        SUM(CASE WHEN CT.KetQuaNghiemThuChiTiet = N'Không đạt' THEN 1 ELSE 0 END) AS SoViecKhongDat
      FROM KeHoachPhanCong PC
      LEFT JOIN KeHoachCongViec KH ON KH.MaKeHoach = PC.MaKHCV
      LEFT JOIN NguoiDung NDTao ON NDTao.MaNguoiDung = PC.NguoiTao
      LEFT JOIN NguoiDung NDNghiemThu ON NDNghiemThu.MaNguoiDung = PC.NguoiNghiemThu
      LEFT JOIN ChiTietPhanCong CT ON CT.MaKHPC = PC.MaKHPC
      WHERE
        (@Keyword IS NULL OR PC.MaKHPC LIKE @Keyword OR PC.TieuDe LIKE @Keyword OR KH.TieuDe LIKE @Keyword)
        AND (@MaKHCV IS NULL OR PC.MaKHCV = @MaKHCV)
        AND (@TrangThaiNghiemThu IS NULL OR PC.TrangThaiNghiemThu = @TrangThaiNghiemThu)
        AND (@NguoiTao IS NULL OR PC.NguoiTao = @NguoiTao)
        AND (@TuNgay IS NULL OR PC.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR PC.NgayTao <= @DenNgay)
      GROUP BY
        PC.MaKHPC,
        PC.MaKHCV,
        KH.TieuDe,
        PC.TieuDe,
        PC.FilePDF,
        PC.NguoiTao,
        NDTao.HoTen,
        PC.TrangThaiNghiemThu,
        PC.YKienNghiemThu,
        PC.NguoiNghiemThu,
        NDNghiemThu.HoTen,
        PC.NgayNghiemThu,
        PC.NgayTao,
        PC.NgayCapNhat
      ORDER BY PC.NgayTao DESC, PC.MaKHPC DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaKHCV", sql.VarChar, maKHCV)
    .input("TrangThaiNghiemThu", sql.NVarChar, trangThaiNghiemThu)
    .input("NguoiTao", sql.VarChar, nguoiTao)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .query(`
      SELECT COUNT(1) AS Total
      FROM KeHoachPhanCong PC
      LEFT JOIN KeHoachCongViec KH ON KH.MaKeHoach = PC.MaKHCV
      WHERE
        (@Keyword IS NULL OR PC.MaKHPC LIKE @Keyword OR PC.TieuDe LIKE @Keyword OR KH.TieuDe LIKE @Keyword)
        AND (@MaKHCV IS NULL OR PC.MaKHCV = @MaKHCV)
        AND (@TrangThaiNghiemThu IS NULL OR PC.TrangThaiNghiemThu = @TrangThaiNghiemThu)
        AND (@NguoiTao IS NULL OR PC.NguoiTao = @NguoiTao)
        AND (@TuNgay IS NULL OR PC.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR PC.NgayTao <= @DenNgay)
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
 * Tìm kế hoạch phân công theo mã.
 */
const findAssignmentById = async (maKHPC) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKHPC", sql.VarChar, maKHPC)
    .query(`
      SELECT
        PC.MaKHPC,
        PC.MaKHCV,
        KH.TieuDe AS TieuDeKeHoach,
        KH.TrangThai AS TrangThaiKeHoach,
        PC.TieuDe,
        PC.FilePDF,
        PC.NguoiTao,
        NDTao.HoTen AS TenNguoiTao,
        PC.TrangThaiNghiemThu,
        PC.YKienNghiemThu,
        PC.NguoiNghiemThu,
        NDNghiemThu.HoTen AS TenNguoiNghiemThu,
        PC.NgayNghiemThu,
        PC.NgayTao,
        PC.NgayCapNhat
      FROM KeHoachPhanCong PC
      LEFT JOIN KeHoachCongViec KH ON KH.MaKeHoach = PC.MaKHCV
      LEFT JOIN NguoiDung NDTao ON NDTao.MaNguoiDung = PC.NguoiTao
      LEFT JOIN NguoiDung NDNghiemThu ON NDNghiemThu.MaNguoiDung = PC.NguoiNghiemThu
      WHERE PC.MaKHPC = @MaKHPC
    `);

  return result.recordset[0] || null;
};

/**
 * Nghiệm thu toàn bộ kế hoạch phân công.
 */
const finalReviewAssignment = async (maKHPC, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKHPC", sql.VarChar, maKHPC)
    .input("TrangThaiNghiemThu", sql.NVarChar, data.trangThaiNghiemThu)
    .input("YKienNghiemThu", sql.NVarChar, data.yKienNghiemThu || null)
    .input("NguoiNghiemThu", sql.VarChar, data.nguoiNghiemThu || null)
    .query(`
      UPDATE KeHoachPhanCong
      SET
        TrangThaiNghiemThu = @TrangThaiNghiemThu,
        YKienNghiemThu = COALESCE(@YKienNghiemThu, YKienNghiemThu),
        NguoiNghiemThu = COALESCE(@NguoiNghiemThu, NguoiNghiemThu),
        NgayNghiemThu = GETDATE(),
        NgayCapNhat = GETDATE()
      WHERE MaKHPC = @MaKHPC;

      SELECT *
      FROM KeHoachPhanCong
      WHERE MaKHPC = @MaKHPC;
    `);

  return result.recordset[0];
};

module.exports = {
  generateAssignmentId,
  findPlanById,
  findUserById,
  createAssignment,
  findAssignments,
  findAssignmentById,
  finalReviewAssignment
};