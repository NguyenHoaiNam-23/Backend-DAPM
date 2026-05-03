const { getConnection, sql } = require("../../database/connection");

/**
 * REPORT TREES
 */
const getTreesForReport = async (query) => {
  const pool = await getConnection();

  const keyword = query.keyword || null;
  const maDMCay = query.maDMCay || null;
  const maTuyenDuong = query.maTuyenDuong || null;
  const maXaPhuong = query.maXaPhuong || null;
  const trangThaiSucKhoe = query.trangThaiSucKhoe || null;
  const ngayTrongTu = query.ngayTrongTu || null;
  const ngayTrongDen = query.ngayTrongDen || null;

  const result = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaDMCay", sql.VarChar, maDMCay)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiSucKhoe", sql.NVarChar, trangThaiSucKhoe)
    .input("NgayTrongTu", sql.DateTime, ngayTrongTu)
    .input("NgayTrongDen", sql.DateTime, ngayTrongDen)
    .query(`
      SELECT
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        DMC.LoaiCay,
        CX.NgayTrong,
        CX.NguonGoc,
        CX.ChieuCaoHienTai,
        CX.DuongKinhThanHienTai,
        CX.DuongKinhTanHienTai,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.GhiChu,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong,
        CX.NgayTao,
        CX.NgayCapNhat
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      WHERE
        (
          @Keyword IS NULL
          OR CX.MaCay LIKE @Keyword
          OR DMC.TenCayTrong LIKE @Keyword
          OR TD.TenTuyenDuong LIKE @Keyword
          OR XP.TenXaPhuong LIKE @Keyword
        )
        AND (@MaDMCay IS NULL OR CX.MaDMCay = @MaDMCay)
        AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
        AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiSucKhoe IS NULL OR CX.TrangThaiSucKhoe = @TrangThaiSucKhoe)
        AND (@NgayTrongTu IS NULL OR CX.NgayTrong >= @NgayTrongTu)
        AND (@NgayTrongDen IS NULL OR CX.NgayTrong <= @NgayTrongDen)
      ORDER BY XP.TenXaPhuong ASC, TD.TenTuyenDuong ASC, CX.MaCay ASC
    `);

  return result.recordset;
};

/**
 * REPORT PLANS
 */
const getPlansForReport = async (query) => {
  const pool = await getConnection();

  const keyword = query.keyword || null;
  const maLoaiCongViec = query.maLoaiCongViec || null;
  const trangThai = query.trangThai || null;
  const maTuyenDuong = query.maTuyenDuong || null;
  const maXaPhuong = query.maXaPhuong || null;
  const tuNgay = query.tuNgay || null;
  const denNgay = query.denNgay || null;

  const result = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
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
        (
          @Keyword IS NULL
          OR KH.MaKeHoach LIKE @Keyword
          OR KH.TieuDe LIKE @Keyword
          OR KH.MoTa LIKE @Keyword
        )
        AND (@MaLoaiCongViec IS NULL OR KH.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@TrangThai IS NULL OR KH.TrangThai = @TrangThai)
        AND (@MaTuyenDuong IS NULL OR KH.MaTuyenDuong = @MaTuyenDuong)
        AND (@MaXaPhuong IS NULL OR KH.MaXaPhuong = @MaXaPhuong)
        AND (@TuNgay IS NULL OR KH.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR KH.NgayTao <= @DenNgay)
      ORDER BY KH.NgayTao DESC, KH.MaKeHoach DESC
    `);

  return result.recordset;
};

/**
 * REPORT INCIDENTS
 */
const getIncidentsForReport = async (query) => {
  const pool = await getConnection();

  const keyword = query.keyword || null;
  const maXaPhuong = query.maXaPhuong || null;
  const trangThaiXuLy = query.trangThaiXuLy || null;
  const loaiPhanAnh = query.loaiPhanAnh || null;
  const tuNgay = query.tuNgay || null;
  const denNgay = query.denNgay || null;

  const result = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiXuLy", sql.NVarChar, trangThaiXuLy)
    .input("LoaiPhanAnh", sql.NVarChar, loaiPhanAnh)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
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
        COUNT(CT.MaChiTietBaoCao) AS SoLuongCayLienQuan,
        MAX(CT.MucDoNguyHiem) AS MucDoNguyHiemCaoNhat
      FROM BaoCaoSuCo BC
      LEFT JOIN NguoiDung NDBaoCao ON NDBaoCao.MaNguoiDung = BC.MaNguoiBaoCao
      LEFT JOIN NguoiDung NDXuLy ON NDXuLy.MaNguoiDung = BC.MaNguoiXuLy
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = BC.MaXaPhuong
      LEFT JOIN ChiTietBaoCao CT ON CT.MaBaoCao = BC.MaBaoCao
      WHERE
        (
          @Keyword IS NULL
          OR BC.MaBaoCao LIKE @Keyword
          OR BC.DiaChiCuThe LIKE @Keyword
          OR BC.LoaiPhanAnh LIKE @Keyword
          OR BC.TraLoiPhanHoi LIKE @Keyword
        )
        AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
        AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
        AND (@LoaiPhanAnh IS NULL OR BC.LoaiPhanAnh = @LoaiPhanAnh)
        AND (@TuNgay IS NULL OR BC.ThoiGianBaoCao >= @TuNgay)
        AND (@DenNgay IS NULL OR BC.ThoiGianBaoCao <= @DenNgay)
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
      ORDER BY BC.ThoiGianBaoCao DESC, BC.MaBaoCao DESC
    `);

  return result.recordset;
};

/**
 * REPORT ACCEPTANCE RECORDS
 */
const getAcceptanceRecordsForReport = async (query) => {
  const pool = await getConnection();

  const keyword = query.keyword || null;
  const maLoaiCongViec = query.maLoaiCongViec || null;
  const maXaPhuong = query.maXaPhuong || null;
  const maTuyenDuong = query.maTuyenDuong || null;
  const nguoiTao = query.nguoiTao || null;
  const tuNgay = query.tuNgay || null;
  const denNgay = query.denNgay || null;

  const result = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaLoaiCongViec", sql.VarChar, maLoaiCongViec)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("NguoiTao", sql.VarChar, nguoiTao)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
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
        (
          @Keyword IS NULL
          OR HS.MaHoSo LIKE @Keyword
          OR HS.TieuDe LIKE @Keyword
          OR HS.MoTa LIKE @Keyword
        )
        AND (@MaLoaiCongViec IS NULL OR HS.MaLoaiCongViec = @MaLoaiCongViec)
        AND (@MaXaPhuong IS NULL OR HS.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR HS.MaTuyenDuong = @MaTuyenDuong)
        AND (@NguoiTao IS NULL OR HS.NguoiTao = @NguoiTao)
        AND (@TuNgay IS NULL OR HS.NgayTao >= @TuNgay)
        AND (@DenNgay IS NULL OR HS.NgayTao <= @DenNgay)
      ORDER BY HS.NgayTao DESC, HS.MaHoSo DESC
    `);

  return result.recordset;
};

module.exports = {
  getTreesForReport,
  getPlansForReport,
  getIncidentsForReport,
  getAcceptanceRecordsForReport
};