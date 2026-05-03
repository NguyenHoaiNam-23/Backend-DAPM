const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");

/**
 * Tìm danh mục cây
 */
const findTreeTypeById = async (maDMCay) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .query(`
      SELECT *
      FROM DanhMucCayTrong
      WHERE MaDMCay = @MaDMCay
    `);

  return result.recordset[0] || null;
};

/**
 * Tìm xã phường
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
 * Tìm tuyến đường
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
 * Tìm báo cáo sự cố
 */
const findIncidentById = async (maBaoCao) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaBaoCao", sql.VarChar, maBaoCao)
    .query(`
      SELECT *
      FROM BaoCaoSuCo
      WHERE MaBaoCao = @MaBaoCao
    `);

  return result.recordset[0] || null;
};

/**
 * GET /api/v1/trees
 */
const findTrees = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || null;
  const maDMCay = queryParams.maDMCay || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const trangThaiSucKhoe = queryParams.trangThaiSucKhoe || null;
  const ngayTrongTu = queryParams.ngayTrongTu || null;
  const ngayTrongDen = queryParams.ngayTrongDen || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaDMCay", sql.VarChar, maDMCay)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiSucKhoe", sql.NVarChar, trangThaiSucKhoe)
    .input("NgayTrongTu", sql.DateTime, ngayTrongTu)
    .input("NgayTrongDen", sql.DateTime, ngayTrongDen)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
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
        CX.NgayTao,
        CX.NgayCapNhat,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong,
        CX.MaNguoiCapNhat,
        ND.HoTen AS TenNguoiCapNhat
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = CX.MaNguoiCapNhat
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
      ORDER BY CX.NgayTao DESC, CX.MaCay DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaDMCay", sql.VarChar, maDMCay)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("TrangThaiSucKhoe", sql.NVarChar, trangThaiSucKhoe)
    .input("NgayTrongTu", sql.DateTime, ngayTrongTu)
    .input("NgayTrongDen", sql.DateTime, ngayTrongDen)
    .query(`
      SELECT COUNT(1) AS Total
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
    `);

  const total = countResult.recordset[0].Total;

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total })
  };
};

/**
 * GET /api/v1/trees/:maCay
 */
const findTreeById = async (maCay) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .query(`
      SELECT
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        DMC.ChieuCaoTruongThanh,
        DMC.DuongKinhTruongThanh,
        DMC.HinhThucTanCay,
        DMC.DangLa,
        DMC.MauLa,
        DMC.KyRungLa,
        DMC.KyNoHoa,
        DMC.MauHoa,
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
        CX.NgayTao,
        CX.NgayCapNhat,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        TD.TenVietTat,
        TD.LoaiDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong,
        CX.MaNguoiCapNhat,
        ND.HoTen AS TenNguoiCapNhat
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      LEFT JOIN NguoiDung ND ON ND.MaNguoiDung = CX.MaNguoiCapNhat
      WHERE CX.MaCay = @MaCay
    `);

  return result.recordset[0] || null;
};

/**
 * POST /api/v1/trees
 */
const createTree = async (data) => {
  const pool = await getConnection();

  const dummyMaCay = `DUMMY_${Date.now()}`;

  /**
   * Trigger trg_GenerateMaCay sẽ thay dummyMaCay bằng mã thật:
   * Ví dụ: VNG-C001, LVH-C001.
   */
  await pool.request()
    .input("MaCay", sql.VarChar, dummyMaCay)
    .input("MaDMCay", sql.VarChar, data.maDMCay)
    .input("NgayTrong", sql.DateTime, data.ngayTrong || null)
    .input("NguonGoc", sql.NVarChar, data.nguonGoc || null)
    .input("ChieuCaoHienTai", sql.Decimal(18, 2), data.chieuCaoHienTai ?? 0)
    .input("DuongKinhThanHienTai", sql.Decimal(18, 2), data.duongKinhThanHienTai ?? 0)
    .input("DuongKinhTanHienTai", sql.Decimal(18, 2), data.duongKinhTanHienTai ?? null)
    .input("TrangThaiSucKhoe", sql.NVarChar, data.trangThaiSucKhoe || "Bình thường")
    .input("KinhDo", sql.VarChar, data.kinhDo || null)
    .input("ViDo", sql.VarChar, data.viDo || null)
    .input("GhiChu", sql.NVarChar, data.ghiChu || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .input("MaNguoiCapNhat", sql.VarChar, data.maNguoiCapNhat || null)
    .query(`
      INSERT INTO CayXanh (
        MaCay,
        MaDMCay,
        NgayTrong,
        NguonGoc,
        ChieuCaoHienTai,
        DuongKinhThanHienTai,
        DuongKinhTanHienTai,
        TrangThaiSucKhoe,
        KinhDo,
        ViDo,
        GhiChu,
        MaTuyenDuong,
        MaXaPhuong,
        MaNguoiCapNhat
      )
      VALUES (
        @MaCay,
        @MaDMCay,
        @NgayTrong,
        @NguonGoc,
        @ChieuCaoHienTai,
        @DuongKinhThanHienTai,
        @DuongKinhTanHienTai,
        @TrangThaiSucKhoe,
        @KinhDo,
        @ViDo,
        @GhiChu,
        @MaTuyenDuong,
        @MaXaPhuong,
        @MaNguoiCapNhat
      )
    `);

  /**
   * Vì trigger tự sinh mã cây, cần lấy cây mới nhất theo tuyến đường + người cập nhật.
   */
  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong)
    .query(`
      SELECT TOP 1
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        CX.NgayTrong,
        CX.NguonGoc,
        CX.ChieuCaoHienTai,
        CX.DuongKinhThanHienTai,
        CX.DuongKinhTanHienTai,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.GhiChu,
        CX.NgayTao,
        CX.NgayCapNhat,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      WHERE CX.MaTuyenDuong = @MaTuyenDuong
        AND CX.MaXaPhuong = @MaXaPhuong
      ORDER BY CX.NgayTao DESC, CX.MaCay DESC
    `);

  return result.recordset[0];
};

/**
 * PUT /api/v1/trees/:maCay
 */
const updateTree = async (maCay, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .input("MaDMCay", sql.VarChar, data.maDMCay || null)
    .input("NgayTrong", sql.DateTime, data.ngayTrong || null)
    .input("NguonGoc", sql.NVarChar, data.nguonGoc || null)
    .input("ChieuCaoHienTai", sql.Decimal(18, 2), data.chieuCaoHienTai ?? null)
    .input("DuongKinhThanHienTai", sql.Decimal(18, 2), data.duongKinhThanHienTai ?? null)
    .input("DuongKinhTanHienTai", sql.Decimal(18, 2), data.duongKinhTanHienTai ?? null)
    .input("TrangThaiSucKhoe", sql.NVarChar, data.trangThaiSucKhoe || null)
    .input("KinhDo", sql.VarChar, data.kinhDo || null)
    .input("ViDo", sql.VarChar, data.viDo || null)
    .input("GhiChu", sql.NVarChar, data.ghiChu || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MaNguoiCapNhat", sql.VarChar, data.maNguoiCapNhat || null)
    .query(`
      UPDATE CayXanh
      SET
        MaDMCay = COALESCE(@MaDMCay, MaDMCay),
        NgayTrong = COALESCE(@NgayTrong, NgayTrong),
        NguonGoc = COALESCE(@NguonGoc, NguonGoc),
        ChieuCaoHienTai = COALESCE(@ChieuCaoHienTai, ChieuCaoHienTai),
        DuongKinhThanHienTai = COALESCE(@DuongKinhThanHienTai, DuongKinhThanHienTai),
        DuongKinhTanHienTai = COALESCE(@DuongKinhTanHienTai, DuongKinhTanHienTai),
        TrangThaiSucKhoe = COALESCE(@TrangThaiSucKhoe, TrangThaiSucKhoe),
        KinhDo = COALESCE(@KinhDo, KinhDo),
        ViDo = COALESCE(@ViDo, ViDo),
        GhiChu = COALESCE(@GhiChu, GhiChu),
        MaTuyenDuong = COALESCE(@MaTuyenDuong, MaTuyenDuong),
        MaXaPhuong = COALESCE(@MaXaPhuong, MaXaPhuong),
        MaNguoiCapNhat = COALESCE(@MaNguoiCapNhat, MaNguoiCapNhat),
        NgayCapNhat = GETDATE()
      WHERE MaCay = @MaCay;

      SELECT
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        CX.NgayTrong,
        CX.NguonGoc,
        CX.ChieuCaoHienTai,
        CX.DuongKinhThanHienTai,
        CX.DuongKinhTanHienTai,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.GhiChu,
        CX.NgayTao,
        CX.NgayCapNhat,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong,
        CX.MaNguoiCapNhat
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      WHERE CX.MaCay = @MaCay;
    `);

  return result.recordset[0];
};

/**
 * PUT /api/v1/trees/:maCay/location
 */
const updateTreeLocation = async (maCay, data) => {
  const pool = await getConnection();

  const ghiChuBoSung = data.lyDoCapNhat
    ? `\n[Cập nhật vị trí] ${data.lyDoCapNhat}`
    : "";

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .input("KinhDo", sql.VarChar, data.kinhDo)
    .input("ViDo", sql.VarChar, data.viDo)
    .input("GhiChuBoSung", sql.NVarChar, ghiChuBoSung)
    .input("MaNguoiCapNhat", sql.VarChar, data.maNguoiCapNhat || null)
    .query(`
      UPDATE CayXanh
      SET
        KinhDo = @KinhDo,
        ViDo = @ViDo,
        GhiChu = CONCAT(ISNULL(GhiChu, N''), @GhiChuBoSung),
        MaNguoiCapNhat = COALESCE(@MaNguoiCapNhat, MaNguoiCapNhat),
        NgayCapNhat = GETDATE()
      WHERE MaCay = @MaCay;

      SELECT
        CX.MaCay,
        CX.KinhDo,
        CX.ViDo,
        CX.GhiChu,
        CX.NgayCapNhat,
        CX.MaNguoiCapNhat
      FROM CayXanh CX
      WHERE CX.MaCay = @MaCay;
    `);

  return result.recordset[0];
};

/**
 * PUT /api/v1/trees/:maCay/archive
 */
const archiveTree = async (maCay, data) => {
  const pool = await getConnection();

  const ghiChuBoSung = data.lyDo
    ? `\n[Lưu trữ cây] ${data.lyDo}`
    : "";

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .input("TrangThaiSucKhoe", sql.NVarChar, data.trangThaiSucKhoe)
    .input("GhiChuBoSung", sql.NVarChar, ghiChuBoSung)
    .input("MaNguoiCapNhat", sql.VarChar, data.maNguoiCapNhat || null)
    .query(`
      UPDATE CayXanh
      SET
        TrangThaiSucKhoe = @TrangThaiSucKhoe,
        GhiChu = CONCAT(ISNULL(GhiChu, N''), @GhiChuBoSung),
        MaNguoiCapNhat = COALESCE(@MaNguoiCapNhat, MaNguoiCapNhat),
        NgayCapNhat = GETDATE()
      WHERE MaCay = @MaCay;

      SELECT
        MaCay,
        TrangThaiSucKhoe,
        GhiChu,
        NgayCapNhat,
        MaNguoiCapNhat
      FROM CayXanh
      WHERE MaCay = @MaCay;
    `);

  return result.recordset[0];
};

/**
 * GET /api/v1/trees/map
 */
const findTreesForMap = async (queryParams) => {
  const pool = await getConnection();

  const maXaPhuong = queryParams.maXaPhuong || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;
  const maDMCay = queryParams.maDMCay || null;
  const trangThaiSucKhoe = queryParams.trangThaiSucKhoe || null;

  /**
   * bbox=minLng,minLat,maxLng,maxLat
   */
  let minLng = null;
  let minLat = null;
  let maxLng = null;
  let maxLat = null;

  if (queryParams.bbox) {
    const parts = queryParams.bbox.split(",").map(Number);

    if (parts.length === 4 && parts.every((item) => !Number.isNaN(item))) {
      [minLng, minLat, maxLng, maxLat] = parts;
    }
  }

  const result = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaDMCay", sql.VarChar, maDMCay)
    .input("TrangThaiSucKhoe", sql.NVarChar, trangThaiSucKhoe)
    .input("MinLng", sql.Float, minLng)
    .input("MinLat", sql.Float, minLat)
    .input("MaxLng", sql.Float, maxLng)
    .input("MaxLat", sql.Float, maxLat)
    .query(`
      SELECT
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        DMC.LoaiCay,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      WHERE
        CX.KinhDo IS NOT NULL
        AND CX.ViDo IS NOT NULL
        AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
        AND (@MaDMCay IS NULL OR CX.MaDMCay = @MaDMCay)
        AND (@TrangThaiSucKhoe IS NULL OR CX.TrangThaiSucKhoe = @TrangThaiSucKhoe)
        AND (
          @MinLng IS NULL
          OR (
            TRY_CAST(CX.KinhDo AS FLOAT) BETWEEN @MinLng AND @MaxLng
            AND TRY_CAST(CX.ViDo AS FLOAT) BETWEEN @MinLat AND @MaxLat
          )
        )
      ORDER BY CX.MaCay ASC
    `);

  return result.recordset;
};

/**
 * GET /api/v1/trees/dangerous
 */
const findDangerousTrees = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const maXaPhuong = queryParams.maXaPhuong || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;
  const mucDoNguyHiem = queryParams.mucDoNguyHiem || null;

  const dataResult = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MucDoNguyHiem", sql.NVarChar, mucDoNguyHiem)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong,
        CTBC.MucDoNguyHiem,
        CTBC.MoTaTìnhTrang,
        BCSC.MaBaoCao,
        BCSC.LoaiPhanAnh,
        BCSC.TrangThaiXuLy,
        BCSC.ThoiGianBaoCao
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      LEFT JOIN ChiTietBaoCao CTBC ON CTBC.MaCay = CX.MaCay
      LEFT JOIN BaoCaoSuCo BCSC ON BCSC.MaBaoCao = CTBC.MaBaoCao
      WHERE
        (
          CX.TrangThaiSucKhoe IN (N'Nguy hiểm', N'Yếu')
          OR CTBC.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
        )
        AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
        AND (@MucDoNguyHiem IS NULL OR CTBC.MucDoNguyHiem = @MucDoNguyHiem)
      ORDER BY
        CASE CTBC.MucDoNguyHiem
          WHEN N'Khẩn cấp' THEN 1
          WHEN N'Cao' THEN 2
          WHEN N'Trung bình' THEN 3
          WHEN N'Thấp' THEN 4
          ELSE 5
        END,
        BCSC.ThoiGianBaoCao DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MucDoNguyHiem", sql.NVarChar, mucDoNguyHiem)
    .query(`
      SELECT COUNT(1) AS Total
      FROM CayXanh CX
      LEFT JOIN ChiTietBaoCao CTBC ON CTBC.MaCay = CX.MaCay
      WHERE
        (
          CX.TrangThaiSucKhoe IN (N'Nguy hiểm', N'Yếu')
          OR CTBC.MucDoNguyHiem IN (N'Cao', N'Khẩn cấp')
        )
        AND (@MaXaPhuong IS NULL OR CX.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR CX.MaTuyenDuong = @MaTuyenDuong)
        AND (@MucDoNguyHiem IS NULL OR CTBC.MucDoNguyHiem = @MucDoNguyHiem)
    `);

  const total = countResult.recordset[0].Total;

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total })
  };
};

/**
 * POST /api/v1/trees/:maCay/risk-assessments
 */
const markTreeAsDangerous = async (maCay, data) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = new sql.Request(transaction);

    await request
      .input("MaCay", sql.VarChar, maCay)
      .input("GhiChuBoSung", sql.NVarChar, `\n[Đánh giá nguy hiểm] ${data.moTaDanhGia || ""}. Đề xuất: ${data.deXuatXuLy || ""}`)
      .input("MaNguoiCapNhat", sql.VarChar, data.maNguoiCapNhat || null)
      .query(`
        UPDATE CayXanh
        SET
          TrangThaiSucKhoe = N'Nguy hiểm',
          GhiChu = CONCAT(ISNULL(GhiChu, N''), @GhiChuBoSung),
          MaNguoiCapNhat = COALESCE(@MaNguoiCapNhat, MaNguoiCapNhat),
          NgayCapNhat = GETDATE()
        WHERE MaCay = @MaCay
      `);

    if (data.maBaoCao) {
      const updateDetailRequest = new sql.Request(transaction);

      await updateDetailRequest
        .input("MaBaoCao", sql.VarChar, data.maBaoCao)
        .input("MaCay", sql.VarChar, maCay)
        .input("MucDoNguyHiem", sql.NVarChar, data.mucDoNguyHiem)
        .input("MoTaTinhTrang", sql.NVarChar, data.moTaDanhGia || null)
        .query(`
          UPDATE ChiTietBaoCao
          SET
            MucDoNguyHiem = @MucDoNguyHiem,
            MoTaTìnhTrang = COALESCE(@MoTaTinhTrang, MoTaTìnhTrang)
          WHERE MaBaoCao = @MaBaoCao
            AND MaCay = @MaCay
        `);
    }

    await transaction.commit();

    return findTreeById(maCay);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * GET /api/v1/trees/:maCay/work-history
 */
const findIncidentHistoryByTreeId = async (maCay) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaCay", sql.VarChar, maCay)
    .query(`
      SELECT
        BCSC.MaBaoCao,
        BCSC.MaNguoiBaoCao,
        NDBaoCao.HoTen AS TenNguoiBaoCao,
        BCSC.ThoiGianBaoCao,
        BCSC.LoaiPhanAnh,
        BCSC.TrangThaiXuLy,
        BCSC.TraLoiPhanHoi,
        BCSC.PDFDinhKemXuLy,
        BCSC.NgayTao,
        BCSC.NgayCapNhat,
        CTBC.MaChiTietBaoCao,
        CTBC.MoTaTìnhTrang,
        CTBC.MucDoNguyHiem,
        CTBC.DaXuLy,
        CTBC.MaTuyenDuong,
        TD.TenTuyenDuong,
        CTBC.MaXaPhuong,
        XP.TenXaPhuong
      FROM ChiTietBaoCao CTBC
      INNER JOIN BaoCaoSuCo BCSC ON BCSC.MaBaoCao = CTBC.MaBaoCao
      LEFT JOIN NguoiDung NDBaoCao ON NDBaoCao.MaNguoiDung = BCSC.MaNguoiBaoCao
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CTBC.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CTBC.MaXaPhuong
      WHERE CTBC.MaCay = @MaCay
      ORDER BY BCSC.NgayTao DESC, BCSC.ThoiGianBaoCao DESC
    `);

  return result.recordset;
};

/**
 * Insert nhiều cây vào CayXanh.
 *
 * SQL có trigger trg_GenerateMaCay nên mỗi dòng vẫn cần truyền MaCay dummy.
 * Trigger sẽ tự sinh mã cây thật theo tuyến đường.
 */
const bulkInsertTrees = async (trees) => {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const insertedItems = [];

    for (const item of trees) {
      const dummyMaCay = `DUMMY_${Date.now()}_${Math.round(Math.random() * 1e9)}`;

      const insertRequest = new sql.Request(transaction);

      await insertRequest
        .input("MaCay", sql.VarChar, dummyMaCay)
        .input("MaDMCay", sql.VarChar, item.maDMCay)
        .input("NgayTrong", sql.DateTime, item.ngayTrong || null)
        .input("NguonGoc", sql.NVarChar, item.nguonGoc || null)
        .input("ChieuCaoHienTai", sql.Decimal(18, 2), item.chieuCaoHienTai ?? 0)
        .input("DuongKinhThanHienTai", sql.Decimal(18, 2), item.duongKinhThanHienTai ?? 0)
        .input("DuongKinhTanHienTai", sql.Decimal(18, 2), item.duongKinhTanHienTai ?? null)
        .input("TrangThaiSucKhoe", sql.NVarChar, item.trangThaiSucKhoe || "Bình thường")
        .input("KinhDo", sql.VarChar, item.kinhDo || null)
        .input("ViDo", sql.VarChar, item.viDo || null)
        .input("GhiChu", sql.NVarChar, item.ghiChu || null)
        .input("MaTuyenDuong", sql.VarChar, item.maTuyenDuong)
        .input("MaXaPhuong", sql.VarChar, item.maXaPhuong)
        .input("MaNguoiCapNhat", sql.VarChar, item.maNguoiCapNhat || null)
        .query(`
          INSERT INTO CayXanh (
            MaCay,
            MaDMCay,
            NgayTrong,
            NguonGoc,
            ChieuCaoHienTai,
            DuongKinhThanHienTai,
            DuongKinhTanHienTai,
            TrangThaiSucKhoe,
            KinhDo,
            ViDo,
            GhiChu,
            MaTuyenDuong,
            MaXaPhuong,
            MaNguoiCapNhat
          )
          VALUES (
            @MaCay,
            @MaDMCay,
            @NgayTrong,
            @NguonGoc,
            @ChieuCaoHienTai,
            @DuongKinhThanHienTai,
            @DuongKinhTanHienTai,
            @TrangThaiSucKhoe,
            @KinhDo,
            @ViDo,
            @GhiChu,
            @MaTuyenDuong,
            @MaXaPhuong,
            @MaNguoiCapNhat
          )
        `);

      insertedItems.push({
        row: item.row,
        maDMCay: item.maDMCay,
        maTuyenDuong: item.maTuyenDuong,
        maXaPhuong: item.maXaPhuong
      });
    }

    await transaction.commit();

    return insertedItems;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Lấy danh sách cây mới nhất sau khi import.
 * Dùng để frontend hiển thị nhanh kết quả.
 */
const findLatestTreesAfterImport = async ({ maTuyenDuong, maXaPhuong, limit = 20 }) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT TOP (@Limit)
        CX.MaCay,
        CX.MaDMCay,
        DMC.TenCayTrong,
        CX.NgayTrong,
        CX.NguonGoc,
        CX.ChieuCaoHienTai,
        CX.DuongKinhThanHienTai,
        CX.DuongKinhTanHienTai,
        CX.TrangThaiSucKhoe,
        CX.KinhDo,
        CX.ViDo,
        CX.GhiChu,
        CX.NgayTao,
        CX.MaTuyenDuong,
        TD.TenTuyenDuong,
        CX.MaXaPhuong,
        XP.TenXaPhuong
      FROM CayXanh CX
      LEFT JOIN DanhMucCayTrong DMC ON DMC.MaDMCay = CX.MaDMCay
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = CX.MaTuyenDuong
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = CX.MaXaPhuong
      WHERE CX.MaTuyenDuong = @MaTuyenDuong
        AND CX.MaXaPhuong = @MaXaPhuong
      ORDER BY CX.NgayTao DESC, CX.MaCay DESC
    `);

  return result.recordset;
};

module.exports = {
  findTreeTypeById,
  findWardById,
  findStreetById,
  findIncidentById,

  findTrees,
  findTreeById,
  createTree,
  updateTree,
  updateTreeLocation,
  archiveTree,

  findTreesForMap,
  findDangerousTrees,
  markTreeAsDangerous,
  findIncidentHistoryByTreeId,
  bulkInsertTrees,
  findLatestTreesAfterImport
};