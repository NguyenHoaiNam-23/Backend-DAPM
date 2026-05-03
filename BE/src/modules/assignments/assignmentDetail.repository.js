const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateAssignmentDetailId = async (transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request.query(`
    SELECT MAX(CAST(SUBSTRING(MaChiTiet, 5, 20) AS INT)) AS MaxNumber
    FROM ChiTietPhanCong
    WHERE MaChiTiet LIKE 'CTPC%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("CTPC", maxNumber + 1, 3);
};

const createAssignmentDetail = async (data, transaction = null) => {
  const request = transaction
    ? new sql.Request(transaction)
    : (await getConnection()).request();

  const result = await request
    .input("MaChiTiet", sql.VarChar, data.maChiTiet)
    .input("MaKHPC", sql.VarChar, data.maKHPC)
    .input("MaCongNhan", sql.VarChar, data.maCongNhan)
    .input("CongViecCuThe", sql.NVarChar, data.congViecCuThe)
    .input("ThoiGianBatDau", sql.DateTime, data.thoiGianBatDau)
    .input("ThoiGianKetThuc", sql.DateTime, data.thoiGianKetThuc)
    .input("DanhGia", sql.NVarChar, data.yeuCauDanhGia || null)
    .input("XacNhanLam", sql.Bit, false)
    .input("XacNhanHoanTat", sql.Bit, false)
    .input("KetQuaNghiemThuChiTiet", sql.NVarChar, "Chưa nghiệm thu")
    .query(`
      INSERT INTO ChiTietPhanCong (
        MaChiTiet,
        MaKHPC,
        MaCongNhan,
        CongViecCuThe,
        ThoiGianBatDau,
        ThoiGianKetThuc,
        DanhGia,
        XacNhanLam,
        XacNhanHoanTat,
        KetQuaNghiemThuChiTiet
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaChiTiet,
        @MaKHPC,
        @MaCongNhan,
        @CongViecCuThe,
        @ThoiGianBatDau,
        @ThoiGianKetThuc,
        @DanhGia,
        @XacNhanLam,
        @XacNhanHoanTat,
        @KetQuaNghiemThuChiTiet
      )
    `);

  return result.recordset[0];
};

const findAssignmentDetailById = async (maChiTiet) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTiet", sql.VarChar, maChiTiet)
    .query(`
      SELECT
        CT.MaChiTiet,
        CT.MaKHPC,
        PC.TieuDe AS TieuDePhanCong,
        PC.MaKHCV,
        KH.TieuDe AS TieuDeKeHoach,
        CT.MaCongNhan,
        ND.HoTen AS TenCongNhan,
        CT.CongViecCuThe,
        CT.ThoiGianBatDau,
        CT.ThoiGianKetThuc,
        CT.XacNhanLam,
        CT.XacNhanHoanTat,
        CT.NgayCapNhat,
        CT.KhoiLuongHoanThanh,
        CT.LyDo,
        CT.DanhGia,
        CT.YeuCauLamLai,
        CT.KetQuaNghiemThuChiTiet,
        CT.LyDoYeuCauLamLai,
        CT.NguoiDanhGia,
        CT.NgayDanhGia
      FROM ChiTietPhanCong CT
      LEFT JOIN KeHoachPhanCong PC ON PC.MaKHPC = CT.MaKHPC
      LEFT JOIN KeHoachCongViec KH ON KH.MaKeHoach = PC.MaKHCV
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = CT.MaCongNhan
      WHERE CT.MaChiTiet = @MaChiTiet
    `);

  return result.recordset[0] || null;
};

const findDetailsByAssignmentId = async (maKHPC) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaKHPC", sql.VarChar, maKHPC)
    .query(`
      SELECT
        CT.MaChiTiet,
        CT.MaKHPC,
        CT.MaCongNhan,
        ND.HoTen AS TenCongNhan,
        CT.CongViecCuThe,
        CT.ThoiGianBatDau,
        CT.ThoiGianKetThuc,
        CT.XacNhanLam,
        CT.XacNhanHoanTat,
        CT.NgayCapNhat,
        CT.KhoiLuongHoanThanh,
        CT.LyDo,
        CT.DanhGia,
        CT.YeuCauLamLai,
        CT.KetQuaNghiemThuChiTiet,
        CT.LyDoYeuCauLamLai,
        CT.NguoiDanhGia,
        CT.NgayDanhGia
      FROM ChiTietPhanCong CT
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = CT.MaCongNhan
      WHERE CT.MaKHPC = @MaKHPC
      ORDER BY CT.ThoiGianBatDau ASC, CT.MaChiTiet ASC
    `);

  return result.recordset;
};

const findMyTasks = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const maCongNhan = queryParams.maCongNhan;
  const trangThai = queryParams.trangThai || null;
  const tuNgay = queryParams.tuNgay || null;
  const denNgay = queryParams.denNgay || null;

  const statusCondition = `
    (
      @TrangThai IS NULL
      OR (@TrangThai = N'Chưa nhận' AND CT.XacNhanLam = 0)
      OR (@TrangThai = N'Đã nhận' AND CT.XacNhanLam = 1 AND CT.XacNhanHoanTat = 0)
      OR (@TrangThai = N'Chờ nghiệm thu' AND CT.XacNhanHoanTat = 1 AND ISNULL(CT.KetQuaNghiemThuChiTiet, N'Chưa nghiệm thu') = N'Chưa nghiệm thu')
      OR (@TrangThai = N'Đạt' AND CT.KetQuaNghiemThuChiTiet = N'Đạt')
      OR (@TrangThai = N'Không đạt' AND CT.KetQuaNghiemThuChiTiet = N'Không đạt')
    )
  `;

  const dataResult = await pool.request()
    .input("MaCongNhan", sql.VarChar, maCongNhan)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        CT.MaChiTiet,
        CT.MaKHPC,
        PC.TieuDe AS TieuDePhanCong,
        PC.MaKHCV,
        KH.TieuDe AS TieuDeKeHoach,
        CT.MaCongNhan,
        ND.HoTen AS TenCongNhan,
        CT.CongViecCuThe,
        CT.ThoiGianBatDau,
        CT.ThoiGianKetThuc,
        CT.XacNhanLam,
        CT.XacNhanHoanTat,
        CT.NgayCapNhat,
        CT.KhoiLuongHoanThanh,
        CT.LyDo,
        CT.KetQuaNghiemThuChiTiet,
        CT.LyDoYeuCauLamLai
      FROM ChiTietPhanCong CT
      LEFT JOIN KeHoachPhanCong PC ON PC.MaKHPC = CT.MaKHPC
      LEFT JOIN KeHoachCongViec KH ON KH.MaKeHoach = PC.MaKHCV
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = CT.MaCongNhan
      WHERE
        CT.MaCongNhan = @MaCongNhan
        AND ${statusCondition}
        AND (@TuNgay IS NULL OR CT.ThoiGianBatDau >= @TuNgay)
        AND (@DenNgay IS NULL OR CT.ThoiGianKetThuc <= @DenNgay)
      ORDER BY CT.ThoiGianBatDau DESC, CT.MaChiTiet DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("MaCongNhan", sql.VarChar, maCongNhan)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("TuNgay", sql.DateTime, tuNgay)
    .input("DenNgay", sql.DateTime, denNgay)
    .query(`
      SELECT COUNT(1) AS Total
      FROM ChiTietPhanCong CT
      WHERE
        CT.MaCongNhan = @MaCongNhan
        AND ${statusCondition}
        AND (@TuNgay IS NULL OR CT.ThoiGianBatDau >= @TuNgay)
        AND (@DenNgay IS NULL OR CT.ThoiGianKetThuc <= @DenNgay)
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

const acceptTask = async (maChiTiet) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTiet", sql.VarChar, maChiTiet)
    .query(`
      UPDATE ChiTietPhanCong
      SET
        XacNhanLam = 1,
        NgayCapNhat = GETDATE()
      WHERE MaChiTiet = @MaChiTiet;

      SELECT *
      FROM ChiTietPhanCong
      WHERE MaChiTiet = @MaChiTiet;
    `);

  return result.recordset[0];
};

const executeTask = async (maChiTiet, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaChiTiet", sql.VarChar, maChiTiet)
    .input("XacNhanHoanTat", sql.Bit, data.xacNhanHoanTat)
    .input("KhoiLuongHoanThanh", sql.NVarChar, data.khoiLuongHoanThanh || null)
    .input("LyDo", sql.NVarChar, data.lyDo || null)
    .input("KetQuaNghiemThuChiTiet", sql.NVarChar, data.xacNhanHoanTat ? "Chưa nghiệm thu" : null)
    .query(`
      UPDATE ChiTietPhanCong
      SET
        XacNhanHoanTat = @XacNhanHoanTat,
        KhoiLuongHoanThanh = COALESCE(@KhoiLuongHoanThanh, KhoiLuongHoanThanh),
        LyDo = COALESCE(@LyDo, LyDo),
        KetQuaNghiemThuChiTiet = COALESCE(@KetQuaNghiemThuChiTiet, KetQuaNghiemThuChiTiet),
        NgayCapNhat = GETDATE()
      WHERE MaChiTiet = @MaChiTiet;

      SELECT *
      FROM ChiTietPhanCong
      WHERE MaChiTiet = @MaChiTiet;
    `);

  return result.recordset[0];
};

const reviewTask = async (maChiTiet, data) => {
  const pool = await getConnection();

  const yeuCauLamLai = data.ketQuaNghiemThuChiTiet === "Không đạt";

  const result = await pool.request()
    .input("MaChiTiet", sql.VarChar, maChiTiet)
    .input("KetQuaNghiemThuChiTiet", sql.NVarChar, data.ketQuaNghiemThuChiTiet)
    .input("DanhGia", sql.NVarChar, data.yeuCauDanhGia || null)
    .input("LyDoYeuCauLamLai", sql.NVarChar, data.lyDoYeuCauLamLai || null)
    .input("YeuCauLamLai", sql.Bit, yeuCauLamLai)
    .input("NguoiDanhGia", sql.VarChar, data.nguoiNghiemThu || null)
    .query(`
      UPDATE ChiTietPhanCong
      SET
        KetQuaNghiemThuChiTiet = @KetQuaNghiemThuChiTiet,
        DanhGia = COALESCE(@DanhGia, DanhGia),
        LyDoYeuCauLamLai = COALESCE(@LyDoYeuCauLamLai, LyDoYeuCauLamLai),
        YeuCauLamLai = @YeuCauLamLai,
        NguoiDanhGia = COALESCE(@NguoiDanhGia, NguoiDanhGia),
        NgayDanhGia = GETDATE(),
        NgayCapNhat = GETDATE()
      WHERE MaChiTiet = @MaChiTiet;

      SELECT *
      FROM ChiTietPhanCong
      WHERE MaChiTiet = @MaChiTiet;
    `);

  return result.recordset[0];
};

const findReworkTasks = async (queryParams) => {
  return findMyTasks({
    ...queryParams,
    trangThai: "Không đạt"
  });
};

const reworkTask = async (maChiTiet, data) => {
  const pool = await getConnection();

  const ghiChuLamLai = data.ghiChuLamLai
    ? `\n[Làm lại] ${data.ghiChuLamLai}`
    : "";

  const result = await pool.request()
    .input("MaChiTiet", sql.VarChar, maChiTiet)
    .input("KhoiLuongHoanThanh", sql.NVarChar, data.khoiLuongHoanThanh || null)
    .input("GhiChuLamLai", sql.NVarChar, ghiChuLamLai)
    .query(`
      UPDATE ChiTietPhanCong
      SET
        XacNhanHoanTat = 1,
        KhoiLuongHoanThanh = COALESCE(@KhoiLuongHoanThanh, KhoiLuongHoanThanh),
        LyDo = CONCAT(ISNULL(LyDo, N''), @GhiChuLamLai),
        KetQuaNghiemThuChiTiet = N'Chưa nghiệm thu',
        LyDoYeuCauLamLai = NULL,
        YeuCauLamLai = 0,
        NgayCapNhat = GETDATE()
      WHERE MaChiTiet = @MaChiTiet;

      SELECT *
      FROM ChiTietPhanCong
      WHERE MaChiTiet = @MaChiTiet;
    `);

  return result.recordset[0];
};

module.exports = {
  generateAssignmentDetailId,
  createAssignmentDetail,
  findAssignmentDetailById,
  findDetailsByAssignmentId,
  findMyTasks,
  acceptTask,
  executeTask,
  reviewTask,
  findReworkTasks,
  reworkTask
};