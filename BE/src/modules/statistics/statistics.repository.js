const { getConnection, sql } = require("../../database/connection");

/**
 * Helper gắn input filter dùng chung.
 */
const addCommonAreaInputs = (request, query) => {
  return request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, query.maTuyenDuong || null);
};

const addCommonDateInputs = (request, query) => {
  return request
    .input("TuNgay", sql.DateTime, query.tuNgay || null)
    .input("DenNgay", sql.DateTime, query.denNgay || null);
};

/**
 * 1. OVERVIEW - TREE SUMMARY
 */
const getTreeSummary = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      COUNT(1) AS TongSoCay,

      SUM(CASE WHEN TrangThaiSucKhoe IN (N'Tốt', N'Bình thường') THEN 1 ELSE 0 END) AS SoCayTot,

      SUM(CASE WHEN TrangThaiSucKhoe = N'Yếu' THEN 1 ELSE 0 END) AS SoCayYeu,

      SUM(CASE WHEN TrangThaiSucKhoe = N'Nguy hiểm' THEN 1 ELSE 0 END) AS SoCayNguyHiem,

      SUM(CASE WHEN TrangThaiSucKhoe = N'Sâu bệnh' THEN 1 ELSE 0 END) AS SoCaySauBenh,

      SUM(CASE WHEN TrangThaiSucKhoe IN (N'Đã chặt hạ', N'Đã di dời', N'Đã chết', N'Ngưng quản lý', N'Không còn tồn tại') THEN 1 ELSE 0 END) AS SoCayNgungQuanLy
    FROM CayXanh
    WHERE
      (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
  `);

  const row = result.recordset[0];

  return {
    tongSoCay: row.TongSoCay || 0,
    soCayTot: row.SoCayTot || 0,
    soCayYeu: row.SoCayYeu || 0,
    soCayNguyHiem: row.SoCayNguyHiem || 0,
    soCaySauBenh: row.SoCaySauBenh || 0,
    soCayNgungQuanLy: row.SoCayNgungQuanLy || 0
  };
};

/**
 * 2. OVERVIEW - PLAN SUMMARY
 */
const getPlanSummary = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  request
    .input("MaLoaiCongViec", sql.VarChar, query.maLoaiCongViec || null)
    .input("TrangThai", sql.NVarChar, query.trangThai || null);

  const result = await request.query(`
    SELECT
      COUNT(1) AS TongSoKeHoach,

      SUM(CASE WHEN TrangThai = N'Đang chờ duyệt' THEN 1 ELSE 0 END) AS DangChoDuyet,

      SUM(CASE WHEN TrangThai = N'Đang chờ thẩm định' THEN 1 ELSE 0 END) AS DangChoThamDinh,

      SUM(CASE WHEN TrangThai = N'Đã duyệt' THEN 1 ELSE 0 END) AS DaDuyet,

      SUM(CASE WHEN TrangThai = N'Đã bị từ chối' THEN 1 ELSE 0 END) AS DaBiTuChoi
    FROM KeHoachCongViec
    WHERE
      (@TuNgay IS NULL OR NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
      AND (@MaLoaiCongViec IS NULL OR MaLoaiCongViec = @MaLoaiCongViec)
      AND (@TrangThai IS NULL OR TrangThai = @TrangThai)
  `);

  const row = result.recordset[0];

  return {
    tongSoKeHoach: row.TongSoKeHoach || 0,
    dangChoDuyet: row.DangChoDuyet || 0,
    dangChoThamDinh: row.DangChoThamDinh || 0,
    daDuyet: row.DaDuyet || 0,
    daBiTuChoi: row.DaBiTuChoi || 0
  };
};

/**
 * 3. OVERVIEW - INCIDENT SUMMARY
 */
const getIncidentSummary = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      COUNT(1) AS TongSoPhanAnh,

      SUM(CASE WHEN TrangThaiXuLy = N'Đã tiếp nhận' THEN 1 ELSE 0 END) AS DaTiepNhan,

      SUM(CASE WHEN TrangThaiXuLy = N'Đang xác minh' THEN 1 ELSE 0 END) AS DangXacMinh,

      SUM(CASE WHEN TrangThaiXuLy = N'Đang xử lý' THEN 1 ELSE 0 END) AS DangXuLy,

      SUM(CASE WHEN TrangThaiXuLy = N'Hoàn thành' THEN 1 ELSE 0 END) AS HoanThanh,

      SUM(CASE WHEN TrangThaiXuLy = N'Từ chối' THEN 1 ELSE 0 END) AS TuChoi
    FROM BaoCaoSuCo
    WHERE
      (@TuNgay IS NULL OR ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR LoaiPhanAnh = @LoaiPhanAnh)
  `);

  const row = result.recordset[0];

  const tongSoPhanAnh = row.TongSoPhanAnh || 0;
  const hoanThanh = row.HoanThanh || 0;

  const tyLeXuLyPhanAnh = tongSoPhanAnh > 0
    ? Number(((hoanThanh / tongSoPhanAnh) * 100).toFixed(2))
    : 0;

  return {
    tongSoPhanAnh,
    daTiepNhan: row.DaTiepNhan || 0,
    dangXacMinh: row.DangXacMinh || 0,
    dangXuLy: row.DangXuLy || 0,
    hoanThanh,
    tuChoi: row.TuChoi || 0,
    tyLeXuLyPhanAnh
  };
};

/**
 * 4. OVERVIEW - ACCEPTANCE RECORD SUMMARY
 */
const getAcceptanceRecordSummary = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  const result = await request.query(`
    SELECT
      COUNT(1) AS TongSoHoSoNghiemThu
    FROM HoSoLuuTruNghiemThu
    WHERE
      (@TuNgay IS NULL OR NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
  `);

  return {
    tongSoHoSoNghiemThu: result.recordset[0].TongSoHoSoNghiemThu || 0
  };
};

/**
 * TREES BY AREA - theo phường.
 */
const getTreesGroupedByWard = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      COUNT(CX.MaCay) AS SoLuongCay,
      SUM(CASE WHEN CX.TrangThaiSucKhoe IN (N'Tốt', N'Bình thường') THEN 1 ELSE 0 END) AS SoCayTot,
      SUM(CASE WHEN CX.TrangThaiSucKhoe = N'Nguy hiểm' THEN 1 ELSE 0 END) AS SoCayNguyHiem,
      SUM(CASE WHEN CX.TrangThaiSucKhoe = N'Sâu bệnh' THEN 1 ELSE 0 END) AS SoCaySauBenh
    FROM XaPhuong XP
    LEFT JOIN CayXanh CX ON CX.MaXaPhuong = XP.MaXaPhuong
    WHERE
      (@MaXaPhuong IS NULL OR XP.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
    GROUP BY XP.MaXaPhuong, XP.TenXaPhuong
    ORDER BY SoLuongCay DESC
  `);

  return result.recordset;
};

/**
 * TREES BY AREA - theo tuyến đường.
 */
const getTreesGroupedByStreet = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      TD.MaTuyenDuong,
      TD.TenTuyenDuong,
      TD.MaXaPhuong,
      XP.TenXaPhuong,
      COUNT(CX.MaCay) AS SoLuongCay,
      SUM(CASE WHEN CX.TrangThaiSucKhoe IN (N'Tốt', N'Bình thường') THEN 1 ELSE 0 END) AS SoCayTot,
      SUM(CASE WHEN CX.TrangThaiSucKhoe = N'Nguy hiểm' THEN 1 ELSE 0 END) AS SoCayNguyHiem,
      SUM(CASE WHEN CX.TrangThaiSucKhoe = N'Sâu bệnh' THEN 1 ELSE 0 END) AS SoCaySauBenh
    FROM TuyenDuong TD
    LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = TD.MaXaPhuong
    LEFT JOIN CayXanh CX ON CX.MaTuyenDuong = TD.MaTuyenDuong
    WHERE
      (@MaXaPhuong IS NULL OR TD.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR TD.MaTuyenDuong = @MaTuyenDuong)
    GROUP BY
      TD.MaTuyenDuong,
      TD.TenTuyenDuong,
      TD.MaXaPhuong,
      XP.TenXaPhuong
    ORDER BY SoLuongCay DESC
  `);

  return result.recordset;
};

/**
 * TREES BY AREA - theo trạng thái sức khỏe.
 */
const getTreesGroupedByHealthStatus = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      ISNULL(TrangThaiSucKhoe, N'Chưa cập nhật') AS TrangThaiSucKhoe,
      COUNT(1) AS SoLuongCay
    FROM CayXanh
    WHERE
      (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
    GROUP BY ISNULL(TrangThaiSucKhoe, N'Chưa cập nhật')
    ORDER BY SoLuongCay DESC
  `);

  return result.recordset;
};

/**
 * TREES BY SPECIES.
 */
const getTreesGroupedBySpecies = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      DMC.MaDMCay,
      DMC.TenCayTrong,
      DMC.LoaiCay,
      COUNT(CX.MaCay) AS SoLuongCay
    FROM DanhMucCayTrong DMC
    LEFT JOIN CayXanh CX ON CX.MaDMCay = DMC.MaDMCay
    WHERE
      (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
    GROUP BY
      DMC.MaDMCay,
      DMC.TenCayTrong,
      DMC.LoaiCay
    ORDER BY SoLuongCay DESC
  `);

  return result.recordset;
};

/**
 * TREES BY SPECIES AND HEALTH.
 */
const getTreesGroupedBySpeciesAndHealth = async (query) => {
  const pool = await getConnection();

  const request = addCommonAreaInputs(pool.request(), query);

  const result = await request.query(`
    SELECT
      DMC.MaDMCay,
      DMC.TenCayTrong,
      ISNULL(CX.TrangThaiSucKhoe, N'Chưa cập nhật') AS TrangThaiSucKhoe,
      COUNT(CX.MaCay) AS SoLuongCay
    FROM DanhMucCayTrong DMC
    LEFT JOIN CayXanh CX ON CX.MaDMCay = DMC.MaDMCay
    WHERE
      (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
    GROUP BY
      DMC.MaDMCay,
      DMC.TenCayTrong,
      ISNULL(CX.TrangThaiSucKhoe, N'Chưa cập nhật')
    ORDER BY DMC.TenCayTrong ASC, SoLuongCay DESC
  `);

  return result.recordset;
};

/**
 * DANGEROUS TREE SUMMARY.
 */
const getDangerousTreeSummary = async (query) => {
  const pool = await getConnection();

  const request = pool.request()
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, query.maTuyenDuong || null)
    .input("MucDoNguyHiem", sql.NVarChar, query.mucDoNguyHiem || null);

  const result = await request.query(`
    SELECT
      COUNT(DISTINCT CX.MaCay) AS TongSoCayNguyHiem,
      COUNT(DISTINCT CASE WHEN CT.MucDoNguyHiem = N'Khẩn cấp' THEN CX.MaCay END) AS SoCayKhanCap,
      COUNT(DISTINCT CASE WHEN CT.MucDoNguyHiem = N'Cao' THEN CX.MaCay END) AS SoCayMucDoCao,
      COUNT(DISTINCT CASE WHEN CX.TrangThaiSucKhoe = N'Nguy hiểm' THEN CX.MaCay END) AS SoCayTrangThaiNguyHiem
    FROM CayXanh CX
    LEFT JOIN ChiTietBaoCao CT ON CT.MaCay = CX.MaCay
    WHERE
      (
        CX.TrangThaiSucKhoe = N'Nguy hiểm'
        OR CT.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
      )
      AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
      AND (@MucDoNguyHiem IS NULL OR CT.MucDoNguyHiem = @MucDoNguyHiem)
  `);

  const row = result.recordset[0];

  return {
    tongSoCayNguyHiem: row.TongSoCayNguyHiem || 0,
    soCayKhanCap: row.SoCayKhanCap || 0,
    soCayMucDoCao: row.SoCayMucDoCao || 0,
    soCayTrangThaiNguyHiem: row.SoCayTrangThaiNguyHiem || 0
  };
};

/**
 * DANGEROUS TREES BY AREA.
 */
const getDangerousTreesByArea = async (query) => {
  const pool = await getConnection();

  const request = pool.request()
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, query.maTuyenDuong || null)
    .input("MucDoNguyHiem", sql.NVarChar, query.mucDoNguyHiem || null);

  const result = await request.query(`
    SELECT
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      TD.MaTuyenDuong,
      TD.TenTuyenDuong,
      COUNT(DISTINCT CX.MaCay) AS SoCayNguyHiem
    FROM CayXanh CX
    LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
    LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
    LEFT JOIN ChiTietBaoCao CT ON CT.MaCay = CX.MaCay
    WHERE
      (
        CX.TrangThaiSucKhoe = N'Nguy hiểm'
        OR CT.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
      )
      AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
      AND (@MucDoNguyHiem IS NULL OR CT.MucDoNguyHiem = @MucDoNguyHiem)
    GROUP BY
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      TD.MaTuyenDuong,
      TD.TenTuyenDuong
    ORDER BY SoCayNguyHiem DESC
  `);

  return result.recordset;
};

/**
 * DANGEROUS TREES BY LEVEL.
 */
const getDangerousTreesByLevel = async (query) => {
  const pool = await getConnection();

  const request = pool.request()
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, query.maTuyenDuong || null)
    .input("MucDoNguyHiem", sql.NVarChar, query.mucDoNguyHiem || null);

  const result = await request.query(`
    SELECT
      ISNULL(CT.MucDoNguyHiem, N'Theo trạng thái cây') AS MucDoNguyHiem,
      COUNT(DISTINCT CX.MaCay) AS SoLuongCay
    FROM CayXanh CX
    LEFT JOIN ChiTietBaoCao CT ON CT.MaCay = CX.MaCay
    WHERE
      (
        CX.TrangThaiSucKhoe = N'Nguy hiểm'
        OR CT.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
      )
      AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
      AND (@MucDoNguyHiem IS NULL OR CT.MucDoNguyHiem = @MucDoNguyHiem)
    GROUP BY ISNULL(CT.MucDoNguyHiem, N'Theo trạng thái cây')
    ORDER BY
      CASE ISNULL(CT.MucDoNguyHiem, N'Theo trạng thái cây')
        WHEN N'Khẩn cấp' THEN 1
        WHEN N'Cao' THEN 2
        WHEN N'Trung bình' THEN 3
        WHEN N'Thấp' THEN 4
        ELSE 5
      END
  `);

  return result.recordset;
};

/**
 * LATEST DANGEROUS REPORTS.
 */
const getLatestDangerousTreeReports = async (query) => {
  const pool = await getConnection();

  const request = pool.request()
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, query.maTuyenDuong || null)
    .input("MucDoNguyHiem", sql.NVarChar, query.mucDoNguyHiem || null);

  const result = await request.query(`
    SELECT TOP 10
      BC.MaBaoCao,
      BC.ThoiGianBaoCao,
      BC.LoaiPhanAnh,
      BC.TrangThaiXuLy,
      CT.MaCay,
      DMC.TenCayTrong,
      CT.MucDoNguyHiem,
      CT.MoTaTìnhTrang,
      TD.TenTuyenDuong,
      XP.TenXaPhuong
    FROM ChiTietBaoCao CT
    INNER JOIN BaoCaoSuCo BC ON BC.MaBaoCao = CT.MaBaoCao
    LEFT JOIN CayXanh CX ON CX.MaCay = CT.MaCay
    LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
    LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
    LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
    WHERE
      CT.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
      AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
      AND (@MucDoNguyHiem IS NULL OR CT.MucDoNguyHiem = @MucDoNguyHiem)
    ORDER BY BC.ThoiGianBaoCao DESC
  `);

  return result.recordset;
};

/**
 * PLANS BY STATUS.
 */
const getPlansGroupedByStatus = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  request
    .input("MaLoaiCongViec", sql.VarChar, query.maLoaiCongViec || null)
    .input("TrangThai", sql.NVarChar, query.trangThai || null);

  const result = await request.query(`
    SELECT
      TrangThai,
      COUNT(1) AS SoLuongKeHoach
    FROM KeHoachCongViec
    WHERE
      (@TuNgay IS NULL OR NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
      AND (@MaLoaiCongViec IS NULL OR MaLoaiCongViec = @MaLoaiCongViec)
      AND (@TrangThai IS NULL OR TrangThai = @TrangThai)
    GROUP BY TrangThai
    ORDER BY SoLuongKeHoach DESC
  `);

  return result.recordset;
};

/**
 * PLANS BY WORK TYPE.
 */
const getPlansGroupedByWorkType = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  request
    .input("MaLoaiCongViec", sql.VarChar, query.maLoaiCongViec || null)
    .input("TrangThai", sql.NVarChar, query.trangThai || null);

  const result = await request.query(`
    SELECT
      DMCV.MaLoaiCongViec,
      DMCV.TenCongViec,
      COUNT(KH.MaKeHoach) AS SoLuongKeHoach
    FROM DanhMucCongViec DMCV
    LEFT JOIN KeHoachCongViec KH ON KH.MaLoaiCongViec = DMCV.MaLoaiCongViec
    WHERE
      (@TuNgay IS NULL OR KH.NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR KH.NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR KH.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR KH.MaTuyenDuong = @MaTuyenDuong)
      AND (@MaLoaiCongViec IS NULL OR KH.MaLoaiCongViec = @MaLoaiCongViec)
      AND (@TrangThai IS NULL OR KH.TrangThai = @TrangThai)
    GROUP BY
      DMCV.MaLoaiCongViec,
      DMCV.TenCongViec
    ORDER BY SoLuongKeHoach DESC
  `);

  return result.recordset;
};

/**
 * PLANS BY AREA.
 */
const getPlansGroupedByArea = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  request
    .input("MaLoaiCongViec", sql.VarChar, query.maLoaiCongViec || null)
    .input("TrangThai", sql.NVarChar, query.trangThai || null);

  const result = await request.query(`
    SELECT
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      TD.MaTuyenDuong,
      TD.TenTuyenDuong,
      COUNT(KH.MaKeHoach) AS SoLuongKeHoach
    FROM KeHoachCongViec KH
    LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = KH.MaXaPhuong
    LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = KH.MaTuyenDuong
    WHERE
      (@TuNgay IS NULL OR KH.NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR KH.NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR KH.MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR KH.MaTuyenDuong = @MaTuyenDuong)
      AND (@MaLoaiCongViec IS NULL OR KH.MaLoaiCongViec = @MaLoaiCongViec)
      AND (@TrangThai IS NULL OR KH.TrangThai = @TrangThai)
    GROUP BY
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      TD.MaTuyenDuong,
      TD.TenTuyenDuong
    ORDER BY SoLuongKeHoach DESC
  `);

  return result.recordset;
};

/**
 * PLAN MONTHLY TREND.
 */
const getPlansMonthlyTrend = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);
  request = addCommonAreaInputs(request, query);

  request
    .input("MaLoaiCongViec", sql.VarChar, query.maLoaiCongViec || null)
    .input("TrangThai", sql.NVarChar, query.trangThai || null);

  const result = await request.query(`
    SELECT
      YEAR(NgayTao) AS Nam,
      MONTH(NgayTao) AS Thang,
      COUNT(1) AS SoLuongKeHoach
    FROM KeHoachCongViec
    WHERE
      (@TuNgay IS NULL OR NgayTao >= @TuNgay)
      AND (@DenNgay IS NULL OR NgayTao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@MaTuyenDuong IS NULL OR MaTuyenDuong = @MaTuyenDuong)
      AND (@MaLoaiCongViec IS NULL OR MaLoaiCongViec = @MaLoaiCongViec)
      AND (@TrangThai IS NULL OR TrangThai = @TrangThai)
    GROUP BY YEAR(NgayTao), MONTH(NgayTao)
    ORDER BY Nam ASC, Thang ASC
  `);

  return result.recordset;
};

/**
 * INCIDENTS BY STATUS.
 */
const getIncidentsGroupedByStatus = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      TrangThaiXuLy,
      COUNT(1) AS SoLuongPhanAnh
    FROM BaoCaoSuCo
    WHERE
      (@TuNgay IS NULL OR ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR LoaiPhanAnh = @LoaiPhanAnh)
    GROUP BY TrangThaiXuLy
    ORDER BY SoLuongPhanAnh DESC
  `);

  return result.recordset;
};

/**
 * INCIDENTS BY TYPE.
 */
const getIncidentsGroupedByType = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      LoaiPhanAnh,
      COUNT(1) AS SoLuongPhanAnh
    FROM BaoCaoSuCo
    WHERE
      (@TuNgay IS NULL OR ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR LoaiPhanAnh = @LoaiPhanAnh)
    GROUP BY LoaiPhanAnh
    ORDER BY SoLuongPhanAnh DESC
  `);

  return result.recordset;
};

/**
 * INCIDENTS BY AREA.
 */
const getIncidentsGroupedByArea = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      XP.MaXaPhuong,
      XP.TenXaPhuong,
      COUNT(BC.MaBaoCao) AS SoLuongPhanAnh
    FROM BaoCaoSuCo BC
    LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = BC.MaXaPhuong
    WHERE
      (@TuNgay IS NULL OR BC.ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR BC.ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR BC.LoaiPhanAnh = @LoaiPhanAnh)
    GROUP BY
      XP.MaXaPhuong,
      XP.TenXaPhuong
    ORDER BY SoLuongPhanAnh DESC
  `);

  return result.recordset;
};

/**
 * INCIDENTS BY DANGER LEVEL.
 */
const getIncidentsGroupedByDangerLevel = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      CT.MucDoNguyHiem,
      COUNT(CT.MaChiTietBaoCao) AS SoLuongChiTiet
    FROM ChiTietBaoCao CT
    INNER JOIN BaoCaoSuCo BC ON BC.MaBaoCao = CT.MaBaoCao
    WHERE
      (@TuNgay IS NULL OR BC.ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR BC.ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR BC.MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR BC.TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR BC.LoaiPhanAnh = @LoaiPhanAnh)
    GROUP BY CT.MucDoNguyHiem
    ORDER BY
      CASE CT.MucDoNguyHiem
        WHEN N'Khẩn cấp' THEN 1
        WHEN N'Cao' THEN 2
        WHEN N'Trung bình' THEN 3
        WHEN N'Thấp' THEN 4
        ELSE 5
      END
  `);

  return result.recordset;
};

/**
 * INCIDENT MONTHLY TREND.
 */
const getIncidentsMonthlyTrend = async (query) => {
  const pool = await getConnection();

  let request = pool.request();

  request = addCommonDateInputs(request, query);

  request
    .input("MaXaPhuong", sql.VarChar, query.maXaPhuong || null)
    .input("TrangThaiXuLy", sql.NVarChar, query.trangThaiXuLy || null)
    .input("LoaiPhanAnh", sql.NVarChar, query.loaiPhanAnh || null);

  const result = await request.query(`
    SELECT
      YEAR(ThoiGianBaoCao) AS Nam,
      MONTH(ThoiGianBaoCao) AS Thang,
      COUNT(1) AS SoLuongPhanAnh
    FROM BaoCaoSuCo
    WHERE
      (@TuNgay IS NULL OR ThoiGianBaoCao >= @TuNgay)
      AND (@DenNgay IS NULL OR ThoiGianBaoCao <= @DenNgay)
      AND (@MaXaPhuong IS NULL OR MaXaPhuong = @MaXaPhuong)
      AND (@TrangThaiXuLy IS NULL OR TrangThaiXuLy = @TrangThaiXuLy)
      AND (@LoaiPhanAnh IS NULL OR LoaiPhanAnh = @LoaiPhanAnh)
    GROUP BY YEAR(ThoiGianBaoCao), MONTH(ThoiGianBaoCao)
    ORDER BY Nam ASC, Thang ASC
  `);

  return result.recordset;
};

module.exports = {
  getTreeSummary,
  getPlanSummary,
  getIncidentSummary,
  getAcceptanceRecordSummary,

  getTreesGroupedByWard,
  getTreesGroupedByStreet,
  getTreesGroupedByHealthStatus,

  getTreesGroupedBySpecies,
  getTreesGroupedBySpeciesAndHealth,

  getDangerousTreeSummary,
  getDangerousTreesByArea,
  getDangerousTreesByLevel,
  getLatestDangerousTreeReports,

  getPlansGroupedByStatus,
  getPlansGroupedByWorkType,
  getPlansGroupedByArea,
  getPlansMonthlyTrend,

  getIncidentsGroupedByStatus,
  getIncidentsGroupedByType,
  getIncidentsGroupedByArea,
  getIncidentsGroupedByDangerLevel,
  getIncidentsMonthlyTrend
};