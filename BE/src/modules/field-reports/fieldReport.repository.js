const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateReportId = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT MAX(CAST(SUBSTRING(MaBaoCao, 3, 20) AS INT)) AS MaxNumber
    FROM BaoCaoSuCo
    WHERE MaBaoCao LIKE 'BC%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("BC", maxNumber + 1, 3);
};

const generateDetailId = async (transaction = null) => {
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

const generateImageId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaHinhAnh, 5, 20) AS INT)) AS MaxNumber
    FROM HinhAnhBaoCao
    WHERE MaHinhAnh LIKE 'HABC%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("HABC", maxNumber + 1, 3);
};

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

const createFieldReport = async (data, transaction) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("MaBaoCao", sql.VarChar, data.maBaoCao)
    .input("MaNguoiBaoCao", sql.VarChar, data.maNguoiBaoCao || null)
    .input("ThoiGianBaoCao", sql.DateTime, new Date())
    .input("LoaiPhanAnh", sql.NVarChar, "Báo cáo hiện trường")
    .input("TrangThaiXuLy", sql.NVarChar, "Đã tiếp nhận")
    .input("TraLoiPhanHoi", sql.NVarChar, data.noiDungBaoCao)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .input("DiaChiCuThe", sql.NVarChar, data.diaChiCuThe)
    .query(`
      INSERT INTO BaoCaoSuCo (
        MaBaoCao,
        MaNguoiBaoCao,
        ThoiGianBaoCao,
        LoaiPhanAnh,
        TrangThaiXuLy,
        TraLoiPhanHoi,
        MaXaPhuong,
        DiaChiCuThe,
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
        @MaXaPhuong,
        @DiaChiCuThe,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const createFieldReportDetail = async (data, transaction) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("MaChiTietBaoCao", sql.VarChar, data.maChiTietBaoCao)
    .input("MaBaoCao", sql.VarChar, data.maBaoCao)
    .input("MaCay", sql.VarChar, data.maCay)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MoTaTinhTrang", sql.NVarChar, data.moTaTinhTrang || null)
    .input("MucDoNguyHiem", sql.NVarChar, data.mucDoNguyHiem || "Thấp")
    .input("DaXuLy", sql.Bit, false)
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

const createFieldReportImage = async (data, transaction) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("MaHinhAnh", sql.VarChar, data.maHinhAnh)
    .input("MaBaoCao", sql.VarChar, data.maBaoCao)
    .input("DuongDanAnh", sql.VarChar, data.duongDanAnh)
    .input("MoTa", sql.NVarChar, data.moTa || null)
    .query(`
      INSERT INTO HinhAnhBaoCao (
        MaHinhAnh,
        MaBaoCao,
        DuongDanAnh,
        MoTa,
        NgayTao
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaHinhAnh,
        @MaBaoCao,
        @DuongDanAnh,
        @MoTa,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const findFieldReports = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const maNguoiBaoCao = queryParams.maNguoiBaoCao || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const trangThaiXuLy = queryParams.trangThaiXuLy || null;

  const dataResult = await pool.request()
    .input("MaNguoiBaoCao", sql.VarChar, maNguoiBaoCao)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiXuLy", sql.NVarChar, trangThaiXuLy)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        BC.MaBaoCao,
        BC.MaNguoiBaoCao,
        ND.HoTen AS TenNguoiBaoCao,
        BC.ThoiGianBaoCao,
        BC.LoaiPhanAnh,
        BC.TrangThaiXuLy,
        BC.TraLoiPhanHoi,
        BC.MaXaPhuong,
        XP.TenXaPhuong,
        BC.DiaChiCuThe,
        BC.NgayTao,
        BC.NgayCapNhat
      FROM BaoCaoSuCo BC
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = BC.MaNguoiBaoCao
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = BC.MaXaPhuong
      WHERE
        BC.LoaiPhanAnh = N'Báo cáo hiện trường'
        AND (@MaNguoiBaoCao IS NULL OR BC.MaNguoiBaoCao = @MaNguoiBaoCao)
        AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
      ORDER BY BC.NgayTao DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("MaNguoiBaoCao", sql.VarChar, maNguoiBaoCao)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiXuLy", sql.NVarChar, trangThaiXuLy)
    .query(`
      SELECT COUNT(1) AS Total
      FROM BaoCaoSuCo BC
      WHERE
        BC.LoaiPhanAnh = N'Báo cáo hiện trường'
        AND (@MaNguoiBaoCao IS NULL OR BC.MaNguoiBaoCao = @MaNguoiBaoCao)
        AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
    `);

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({
      page,
      limit,
      total: countResult.recordset[0].Total
    })
  };
};

const updateStatus = async (maBaoCao, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .input("TrangThaiXuLy", sql.NVarChar, data.trangThaiXuLy)
    .input("GhiChu", sql.NVarChar, data.ghiChu || null)
    .input("MaNguoiXuLy", sql.VarChar, data.maNguoiXuLy || null)
    .query(`
      UPDATE BaoCaoSuCo
      SET
        TrangThaiXuLy = @TrangThaiXuLy,
        TraLoiPhanHoi = COALESCE(@GhiChu, TraLoiPhanHoi),
        MaNguoiXuLy = COALESCE(@MaNguoiXuLy, MaNguoiXuLy),
        NgayCapNhat = GETDATE()
      WHERE MaBaoCao = @MaBaoCao
        AND LoaiPhanAnh = N'Báo cáo hiện trường';

      SELECT *
      FROM BaoCaoSuCo
      WHERE MaBaoCao = @MaBaoCao;
    `);

  return result.recordset[0];
};

module.exports = {
  generateReportId,
  generateDetailId,
  generateImageId,
  findUserById,
  findTreeById,
  createFieldReport,
  createFieldReportDetail,
  createFieldReportImage,
  findFieldReports,
  updateStatus
};