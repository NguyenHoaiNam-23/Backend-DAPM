const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateTreeTypeId = async () => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("PrefixLike", sql.VarChar, "LOAI%")
    .query(`
      SELECT MAX(CAST(SUBSTRING(MaDMCay, 5, 20) AS INT)) AS MaxNumber
      FROM DanhMucCayTrong
      WHERE MaDMCay LIKE @PrefixLike
    `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("LOAI", maxNumber + 1, 2);
};

const findTreeTypes = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);
  const keyword = queryParams.keyword || null;
  const loaiCay = queryParams.loaiCay || null;
  const trangThai = queryParams.trangThai || null;

  const request = pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("LoaiCay", sql.NVarChar, loaiCay)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit);

  const where = `
    WHERE
      (@Keyword IS NULL OR TenCayTrong LIKE @Keyword OR MaDMCay LIKE @Keyword)
      AND (@LoaiCay IS NULL OR LoaiCay = @LoaiCay)
      AND (@TrangThai IS NULL OR TrangThai = @TrangThai)
  `;

  const dataQuery = `
    SELECT
      MaDMCay,
      TenCayTrong,
      ChieuCaoTruongThanh,
      DuongKinhTruongThanh,
      HinhThucTanCay,
      DangLa,
      MauLa,
      KyRungLa,
      KyNoHoa,
      MauHoa,
      LoaiCay,
      MoTa,
      TrangThai,
      NgayTao,
      NgayCapNhat
    FROM DanhMucCayTrong
    ${where}
    ORDER BY NgayTao DESC, MaDMCay DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `;

  const countQuery = `
    SELECT COUNT(1) AS Total
    FROM DanhMucCayTrong
    ${where}
  `;

  const [dataResult, countResult] = await Promise.all([
    request.query(dataQuery),
    pool.request()
      .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
      .input("LoaiCay", sql.NVarChar, loaiCay)
      .input("TrangThai", sql.NVarChar, trangThai)
      .query(countQuery)
  ]);

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({
      page,
      limit,
      total: countResult.recordset[0].Total
    })
  };
};

const findTreeTypeById = async (maDMCay) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .query(`
      SELECT
        MaDMCay,
        TenCayTrong,
        ChieuCaoTruongThanh,
        DuongKinhTruongThanh,
        HinhThucTanCay,
        DangLa,
        MauLa,
        KyRungLa,
        KyNoHoa,
        MauHoa,
        LoaiCay,
        MoTa,
        TrangThai,
        NgayTao,
        NgayCapNhat
      FROM DanhMucCayTrong
      WHERE MaDMCay = @MaDMCay
    `);

  return result.recordset[0] || null;
};

const createTreeType = async (data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, data.maDMCay)
    .input("TenCayTrong", sql.NVarChar, data.tenCayTrong)
    .input("ChieuCaoTruongThanh", sql.Decimal(18, 2), data.chieuCaoTruongThanh ?? null)
    .input("DuongKinhTruongThanh", sql.Decimal(18, 2), data.duongKinhTruongThanh ?? null)
    .input("HinhThucTanCay", sql.NVarChar, data.hinhThucTanCay ?? null)
    .input("DangLa", sql.NVarChar, data.dangLa ?? null)
    .input("MauLa", sql.NVarChar, data.mauLa ?? null)
    .input("KyRungLa", sql.NVarChar, data.kyRungLa ?? null)
    .input("KyNoHoa", sql.NVarChar, data.kyNoHoa ?? null)
    .input("MauHoa", sql.NVarChar, data.mauHoa ?? null)
    .input("LoaiCay", sql.NVarChar, data.loaiCay ?? null)
    .input("MoTa", sql.NVarChar, data.moTa ?? null)
    .input("TrangThai", sql.NVarChar, data.trangThai || "Hoạt động")
    .query(`
      INSERT INTO DanhMucCayTrong (
        MaDMCay,
        TenCayTrong,
        ChieuCaoTruongThanh,
        DuongKinhTruongThanh,
        HinhThucTanCay,
        DangLa,
        MauLa,
        KyRungLa,
        KyNoHoa,
        MauHoa,
        LoaiCay,
        MoTa,
        TrangThai,
        NgayTao
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaDMCay,
        @TenCayTrong,
        @ChieuCaoTruongThanh,
        @DuongKinhTruongThanh,
        @HinhThucTanCay,
        @DangLa,
        @MauLa,
        @KyRungLa,
        @KyNoHoa,
        @MauHoa,
        @LoaiCay,
        @MoTa,
        @TrangThai,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const updateTreeType = async (maDMCay, data) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .input("TenCayTrong", sql.NVarChar, data.tenCayTrong ?? null)
    .input("ChieuCaoTruongThanh", sql.Decimal(18, 2), data.chieuCaoTruongThanh ?? null)
    .input("DuongKinhTruongThanh", sql.Decimal(18, 2), data.duongKinhTruongThanh ?? null)
    .input("HinhThucTanCay", sql.NVarChar, data.hinhThucTanCay ?? null)
    .input("DangLa", sql.NVarChar, data.dangLa ?? null)
    .input("MauLa", sql.NVarChar, data.mauLa ?? null)
    .input("KyRungLa", sql.NVarChar, data.kyRungLa ?? null)
    .input("KyNoHoa", sql.NVarChar, data.kyNoHoa ?? null)
    .input("MauHoa", sql.NVarChar, data.mauHoa ?? null)
    .input("LoaiCay", sql.NVarChar, data.loaiCay ?? null)
    .input("MoTa", sql.NVarChar, data.moTa ?? null)
    .input("TrangThai", sql.NVarChar, data.trangThai ?? null)
    .query(`
      UPDATE DanhMucCayTrong
      SET
        TenCayTrong = COALESCE(@TenCayTrong, TenCayTrong),
        ChieuCaoTruongThanh = COALESCE(@ChieuCaoTruongThanh, ChieuCaoTruongThanh),
        DuongKinhTruongThanh = COALESCE(@DuongKinhTruongThanh, DuongKinhTruongThanh),
        HinhThucTanCay = COALESCE(@HinhThucTanCay, HinhThucTanCay),
        DangLa = COALESCE(@DangLa, DangLa),
        MauLa = COALESCE(@MauLa, MauLa),
        KyRungLa = COALESCE(@KyRungLa, KyRungLa),
        KyNoHoa = COALESCE(@KyNoHoa, KyNoHoa),
        MauHoa = COALESCE(@MauHoa, MauHoa),
        LoaiCay = COALESCE(@LoaiCay, LoaiCay),
        MoTa = COALESCE(@MoTa, MoTa),
        TrangThai = COALESCE(@TrangThai, TrangThai),
        NgayCapNhat = GETDATE()
      OUTPUT INSERTED.*
      WHERE MaDMCay = @MaDMCay
    `);

  return result.recordset[0];
};

const deactivateTreeType = async (maDMCay) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .query(`
      UPDATE DanhMucCayTrong
      SET
        TrangThai = N'Ngưng sử dụng',
        NgayCapNhat = GETDATE()
      OUTPUT INSERTED.*
      WHERE MaDMCay = @MaDMCay
    `);

  return result.recordset[0];
};

const deleteTreeType = async (maDMCay) => {
  const pool = await getConnection();
  await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .query(`
      DELETE FROM DanhMucCayTrong
      WHERE MaDMCay = @MaDMCay
    `);

  return { maDMCay };
};

const isTreeTypeUsed = async (maDMCay) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input("MaDMCay", sql.VarChar, maDMCay)
    .query(`
      SELECT COUNT(1) AS Total
      FROM CayXanh
      WHERE MaDMCay = @MaDMCay
    `);

  return result.recordset[0].Total > 0;
};

module.exports = {
  generateTreeTypeId,
  findTreeTypes,
  findTreeTypeById,
  createTreeType,
  updateTreeType,
  deactivateTreeType,
  deleteTreeType,
  isTreeTypeUsed
};
