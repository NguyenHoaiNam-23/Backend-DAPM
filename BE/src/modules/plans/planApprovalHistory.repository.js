const { getConnection, sql } = require("../../database/connection");

const findApprovalHistoryByPlanId = async (maKeHoach) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKeHoach", sql.VarChar, maKeHoach)
    .query(`
      SELECT
        KH.MaKeHoach,
        KH.TrangThai AS TrangThaiMoi,
        KH.YKienPheDuyet AS YKien,
        KH.FilePDFBoSungKeHoach AS FileDinhKem,
        KH.NguoiPheDuyet AS NguoiThucHien,
        ND.HoTen AS TenNguoiThucHien,
        KH.NgayPheDuyet AS NgayThucHien
      FROM KeHoachCongViec KH
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = KH.NguoiPheDuyet
      WHERE KH.MaKeHoach = @MaKeHoach
    `);

  const row = result.recordset[0];

  if (!row) {
    return [];
  }

  return [
    {
      MaLichSu: `${row.MaKeHoach}-CURRENT`,
      MaKeHoach: row.MaKeHoach,
      TrangThaiCu: null,
      TrangThaiMoi: row.TrangThaiMoi,
      YKien: row.YKien,
      FileDinhKem: row.FileDinhKem,
      NguoiThucHien: row.NguoiThucHien,
      TenNguoiThucHien: row.TenNguoiThucHien,
      NgayThucHien: row.NgayThucHien
    }
  ];
};

module.exports = {
  findApprovalHistoryByPlanId
};