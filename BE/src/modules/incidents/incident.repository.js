const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

/**
 * Sinh mã báo cáo: BC001, BC002...
 */
const generateIncidentId = async () => {
  const pool = await getConnection();

  const result = await pool.request()
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaBaoCao, 3, 20) AS INT)) AS MaxNumber
      FROM BaoCaoSuCo
      WHERE MaBaoCao LIKE 'BC%'
    `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("BC", maxNumber + 1, 3);
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
 * Tìm cây.
 */
const findTreeById = async (maCay) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .query(`
      SELECT *
      FROM CayXanh
      WHERE MaCay = @MaCay
    `);

  return result.recordset[0] || null;
};

/**
 * Tạo báo cáo sự cố.
 *
 * Lưu ý:
 * BaoCaoSuCo dùng NgayTao, không dùng NgayUpload.
 * HinhAnhBaoCao mới dùng NgayUpload.
 */
const createIncident = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaBaoCao", sql.VarChar, data.maBaoCao)
    .input("MaNguoiBaoCao", sql.VarChar, data.maNguoiBaoCao || null)
    .input("ThoiGianBaoCao", sql.DateTime, data.thoiGianBaoCao || new Date())
    .input("LoaiPhanAnh", sql.NVarChar, data.loaiPhanAnh)
    .input("TrangThaiXuLy", sql.NVarChar, data.trangThaiXuLy || "Đã tiếp nhận")
    .input("TraLoiPhanHoi", sql.NVarChar, data.traLoiPhanHoi || null)
    .input("PDFDinhKemXuLy", sql.VarChar, data.pdfDinhKemXuLy || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .input("DiaChiCuThe", sql.NVarChar, data.diaChiCuThe)
    .input("MaNguoiXuLy", sql.VarChar, data.maNguoiXuLy || null)
    .query(`
      INSERT INTO BaoCaoSuCo (
        MaBaoCao,
        MaNguoiBaoCao,
        ThoiGianBaoCao,
        LoaiPhanAnh,
        TrangThaiXuLy,
        TraLoiPhanHoi,
        PDFDinhKemXuLy,
        MaXaPhuong,
        DiaChiCuThe,
        MaNguoiXuLy,
        NgayTao
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaBaoCao,
        @MaNguoiBaoCao,
        @ThoiGianBaoCao,
        @LoaiPhanAnh,
        @TrangThaiXuLy,
        @TraLoiPhanHoi,
        @PDFDinhKemXuLy,
        @MaXaPhuong,
        @DiaChiCuThe,
        @MaNguoiXuLy,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

/**
 * GET /api/v1/incidents
 */
const findIncidents = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const trangThaiXuLy = queryParams.trangThaiXuLy || null;
  const loaiPhanAnh = queryParams.loaiPhanAnh || null;
  const tuNgay = queryParams.tuNgay || null;
  const denNgay = queryParams.denNgay || null;
  const maNguoiBaoCao = queryParams.maNguoiBaoCao || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiXuLy", sql.NVarChar, trangThaiXuLy)
    .input("LoaiPhanAnh", sql.NVarChar, loaiPhanAnh)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("MaNguoiBaoCao", sql.VarChar, maNguoiBaoCao)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        BC.MaBaoCao,
        BC.MaNguoiBaoCao,
        NDBaoCao.HoTen AS TenNguoiBaoCao,
        BC.ThoiGianBaoCao,
        BC.LoaiPhanAnh,
        BC.TrangThaiXuLy,
        BC.TraLoiPhanHoi,
        BC.PDFDinhKemXuLy,
        BC.MaXaPhuong,
        XP.TenXaPhuong,
        BC.DiaChiCuThe,
        BC.MaNguoiXuLy,
        NDXuLy.HoTen AS TenNguoiXuLy,
        BC.NgayTao,
        BC.NgayCapNhat,
        COUNT(CT.MaChiTietBaoCao) AS SoLuongCayLienQuan
      FROM BaoCaoSuCo BC
      LEFT JOIN NguoiDung NDBaoCao ON NDBaoCao.MaNguoiDung = BC.MaNguoiBaoCao
      LEFT JOIN NguoiDung NDXuLy ON NDXuLy.MaNguoiDung = BC.MaNguoiXuLy
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = BC.MaXaPhuong
      LEFT JOIN ChiTietBaoCao CT ON CT.MaBaoCao = BC.MaBaoCao
      WHERE
        (@Keyword IS NULL OR BC.MaBaoCao LIKE @Keyword OR BC.DiaChiCuThe LIKE @Keyword OR BC.LoaiPhanAnh LIKE @Keyword)
        AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
        AND (@LoaiPhanAnh IS NULL OR BC.LoaiPhanAnh = @LoaiPhanAnh)
        AND (@TuNgay IS NULL OR BC.ThoiGianBaoCao >= @TuNgay)
        AND (@DenNgay IS NULL OR BC.ThoiGianBaoCao <= @DenNgay)
        AND (@MaNguoiBaoCao IS NULL OR BC.MaNguoiBaoCao = @MaNguoiBaoCao)
      GROUP BY
        BC.MaBaoCao,
        BC.MaNguoiBaoCao,
        NDBaoCao.HoTen,
        BC.ThoiGianBaoCao,
        BC.LoaiPhanAnh,
        BC.TrangThaiXuLy,
        BC.TraLoiPhanHoi,
        BC.PDFDinhKemXuLy,
        BC.MaXaPhuong,
        XP.TenXaPhuong,
        BC.DiaChiCuThe,
        BC.MaNguoiXuLy,
        NDXuLy.HoTen,
        BC.NgayTao,
        BC.NgayCapNhat
      ORDER BY BC.NgayTao DESC, BC.ThoiGianBaoCao DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiXuLy", sql.NVarChar, trangThaiXuLy)
    .input("LoaiPhanAnh", sql.NVarChar, loaiPhanAnh)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("MaNguoiBaoCao", sql.VarChar, maNguoiBaoCao)
    .query(`
      SELECT COUNT(1) AS Total
      FROM BaoCaoSuCo BC
      WHERE
        (@Keyword IS NULL OR BC.MaBaoCao LIKE @Keyword OR BC.DiaChiCuThe LIKE @Keyword OR BC.LoaiPhanAnh LIKE @Keyword)
        AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
        AND (@LoaiPhanAnh IS NULL OR BC.LoaiPhanAnh = @LoaiPhanAnh)
        AND (@TuNgay IS NULL OR BC.ThoiGianBaoCao >= @TuNgay)
        AND (@DenNgay IS NULL OR BC.ThoiGianBaoCao <= @DenNgay)
        AND (@MaNguoiBaoCao IS NULL OR BC.MaNguoiBaoCao = @MaNguoiBaoCao)
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
 * Tìm báo cáo theo mã.
 */
const findIncidentById = async (maBaoCao) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .query(`
      SELECT
        BC.MaBaoCao,
        BC.MaNguoiBaoCao,
        NDBaoCao.HoTen AS TenNguoiBaoCao,
        NDBaoCao.Email AS EmailNguoiBaoCao,
        NDBaoCao.SDT AS SoDienThoaiNguoiBaoCao,
        BC.ThoiGianBaoCao,
        BC.LoaiPhanAnh,
        BC.TrangThaiXuLy,
        BC.TraLoiPhanHoi,
        BC.PDFDinhKemXuLy,
        BC.MaXaPhuong,
        XP.TenXaPhuong,
        BC.DiaChiCuThe,
        BC.MaNguoiXuLy,
        NDXuLy.HoTen AS TenNguoiXuLy,
        BC.NgayTao,
        BC.NgayCapNhat
      FROM BaoCaoSuCo BC
      LEFT JOIN NguoiDung NDBaoCao ON NDBaoCao.MaNguoiDung = BC.MaNguoiBaoCao
      LEFT JOIN NguoiDung NDXuLy ON NDXuLy.MaNguoiDung = BC.MaNguoiXuLy
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = BC.MaXaPhuong
      WHERE BC.MaBaoCao = @MaBaoCao
    `);

  return result.recordset[0] || null;
};

/**
 * Cập nhật trạng thái.
 */
const updateIncidentStatus = async (maBaoCao, data) => {
  const pool = await getConnection();

  const ghiChuBoSung = data.ghiChu
    ? `\n[Cập nhật trạng thái] ${data.ghiChu}`
    : "";

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .input("TrangThaiXuLy", sql.NVarChar, data.trangThaiXuLy)
    .input("MaNguoiXuLy", sql.VarChar, data.maNguoiXuLy || null)
    .input("GhiChuBoSung", sql.NVarChar, ghiChuBoSung)
    .query(`
      UPDATE BaoCaoSuCo
      SET
        TrangThaiXuLy = @TrangThaiXuLy,
        MaNguoiXuLy = COALESCE(@MaNguoiXuLy, MaNguoiXuLy),
        TraLoiPhanHoi = CASE
          WHEN @GhiChuBoSung IS NULL OR @GhiChuBoSung = N'' THEN TraLoiPhanHoi
          ELSE CONCAT(ISNULL(TraLoiPhanHoi, N''), @GhiChuBoSung)
        END,
        NgayCapNhat = GETDATE()
      WHERE MaBaoCao = @MaBaoCao;

      SELECT *
      FROM BaoCaoSuCo
      WHERE MaBaoCao = @MaBaoCao;
    `);

  return result.recordset[0];
};

/**
 * Từ chối phản ánh.
 */
const rejectIncident = async (maBaoCao, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .input("LyDoTuChoi", sql.NVarChar, data.lyDoTuChoi)
    .input("MaNguoiXuLy", sql.VarChar, data.maNguoiXuLy || null)
    .query(`
      UPDATE BaoCaoSuCo
      SET
        TrangThaiXuLy = N'Từ chối',
        TraLoiPhanHoi = @LyDoTuChoi,
        MaNguoiXuLy = COALESCE(@MaNguoiXuLy, MaNguoiXuLy),
        NgayCapNhat = GETDATE()
      WHERE MaBaoCao = @MaBaoCao;

      SELECT *
      FROM BaoCaoSuCo
      WHERE MaBaoCao = @MaBaoCao;
    `);

  return result.recordset[0];
};

/**
 * Phản hồi kết quả xử lý.
 */
const replyIncident = async (maBaoCao, data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .input("TraLoiPhanHoi", sql.NVarChar, data.traLoiPhanHoi)
    .input("PDFDinhKemXuLy", sql.VarChar, data.pdfDinhKemXuLy || null)
    .input("MaNguoiXuLy", sql.VarChar, data.maNguoiXuLy || null)
    .query(`
      UPDATE BaoCaoSuCo
      SET
        TrangThaiXuLy = N'Hoàn thành',
        TraLoiPhanHoi = @TraLoiPhanHoi,
        PDFDinhKemXuLy = COALESCE(@PDFDinhKemXuLy, PDFDinhKemXuLy),
        MaNguoiXuLy = COALESCE(@MaNguoiXuLy, MaNguoiXuLy),
        NgayCapNhat = GETDATE()
      WHERE MaBaoCao = @MaBaoCao;

      SELECT *
      FROM BaoCaoSuCo
      WHERE MaBaoCao = @MaBaoCao;
    `);

  return result.recordset[0];
};

module.exports = {
  generateIncidentId,
  findUserById,
  findWardById,
  findTreeById,
  createIncident,
  findIncidents,
  findIncidentById,
  updateIncidentStatus,
  rejectIncident,
  replyIncident
};
