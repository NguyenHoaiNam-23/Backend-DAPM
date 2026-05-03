const { getConnection } = require("../../database/connection");

const getDashboardSummary = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      (SELECT COUNT(1) FROM NguoiDung) AS TongNguoiDung,
      (SELECT COUNT(1) FROM NguoiDung WHERE TrangThai = N'Hoạt động') AS NguoiDungHoatDong,
      (SELECT COUNT(1) FROM CayXanh) AS TongCayXanh,
      (SELECT COUNT(1) FROM CayXanh WHERE TrangThaiSucKhoe = N'Nguy hiểm') AS TongCayNguyHiem,
      (SELECT COUNT(1) FROM BaoCaoSuCo) AS TongPhanAnh,
      (SELECT COUNT(1) FROM BaoCaoSuCo WHERE TrangThaiXuLy <> N'Hoàn thành') AS PhanAnhChuaHoanThanh,
      (SELECT COUNT(1) FROM KeHoachCongViec) AS TongKeHoach,
      (SELECT COUNT(1) FROM KeHoachCongViec WHERE TrangThai = N'Đang chờ duyệt') AS KeHoachChoDuyet,
      (SELECT COUNT(1) FROM KeHoachPhanCong) AS TongPhanCong,
      (SELECT COUNT(1) FROM HoSoLuuTruNghiemThu) AS TongHoSoNghiemThu
  `);

  return result.recordset[0];
};

const getUserRoleSummary = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      ND.MaVaiTro,
      VT.TenVaiTro,
      COUNT(1) AS SoLuong
    FROM NguoiDung ND
    LEFT JOIN VaiTro VT ON VT.MaVaiTro = ND.MaVaiTro
    GROUP BY ND.MaVaiTro, VT.TenVaiTro
    ORDER BY SoLuong DESC
  `);

  return result.recordset;
};

const getRecentActivities = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT TOP 30 *
    FROM (
      SELECT
        N'Phản ánh sự cố' AS LoaiHoatDong,
        MaBaoCao AS MaDoiTuong,
        LoaiPhanAnh AS NoiDung,
        NgayTao
      FROM BaoCaoSuCo

      UNION ALL

      SELECT
        N'Kế hoạch công việc' AS LoaiHoatDong,
        MaKeHoach AS MaDoiTuong,
        TieuDe AS NoiDung,
        NgayTao
      FROM KeHoachCongViec

      UNION ALL

      SELECT
        N'Hồ sơ nghiệm thu' AS LoaiHoatDong,
        MaHoSo AS MaDoiTuong,
        TieuDe AS NoiDung,
        NgayTao
      FROM HoSoLuuTruNghiemThu
    ) AS Activities
    ORDER BY NgayTao DESC
  `);

  return result.recordset;
};

module.exports = {
  getDashboardSummary,
  getUserRoleSummary,
  getRecentActivities
};