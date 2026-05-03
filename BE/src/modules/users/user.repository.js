const { getConnection, sql } = require("../../database/connection");
const {
  getPagination,
  buildPaginationResponse
} = require("../../common/utils/pagination.util");
const { buildCode } = require("../../common/utils/id.util");

const generateUserId = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT MAX(CAST(SUBSTRING(MaNguoiDung, 2, 20) AS INT)) AS MaxNumber
    FROM NguoiDung
    WHERE MaNguoiDung LIKE 'U%'
  `);

  const maxNumber = result.recordset[0]?.MaxNumber || 0;

  return buildCode("U", maxNumber + 1, 3);
};

const findUsers = async (queryParams) => {
  const pool = await getConnection();
  const { page, limit, offset } = getPagination(queryParams);

  const keyword = queryParams.keyword || null;
  const maVaiTro = queryParams.maVaiTro || queryParams.vaiTro || null;
  const trangThai = queryParams.trangThai || null;
  const maXaPhuong = queryParams.maXaPhuong || null;
  const maTuyenDuong = queryParams.maTuyenDuong || null;

  const dataResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, limit)
    .query(`
      SELECT
        ND.MaNguoiDung,
        ND.TenDangNhap,
        ND.HoTen,
        ND.Email,
        ND.SDT,
        ND.TrangThai,
        ND.MaVaiTro,
        VT.TenVaiTro,
        ND.MaXaPhuong,
        XP.TenXaPhuong,
        ND.MaTuyenDuong,
        TD.TenTuyenDuong,
        ND.DiaChi,
        ND.NgayTao,
        ND.NgayCapNhat
      FROM NguoiDung ND
      LEFT JOIN VaiTro VT ON VT.MaVaiTro = ND.MaVaiTro
      LEFT JOIN XaPhuong XP ON XP.MaXaPhuong = ND.MaXaPhuong
      LEFT JOIN TuyenDuong TD ON TD.MaTuyenDuong = ND.MaTuyenDuong
      WHERE
        (@Keyword IS NULL OR ND.HoTen LIKE @Keyword OR ND.Email LIKE @Keyword OR ND.SDT LIKE @Keyword OR ND.TenDangNhap LIKE @Keyword)
        AND (@MaVaiTro IS NULL OR ND.MaVaiTro = @MaVaiTro)
        AND (@TrangThai IS NULL OR ND.TrangThai = @TrangThai)
        AND (@MaXaPhuong IS NULL OR ND.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR ND.MaTuyenDuong = @MaTuyenDuong)
      ORDER BY ND.NgayTao DESC, ND.MaNguoiDung DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);

  const countResult = await pool.request()
    .input("Keyword", sql.NVarChar, keyword ? `%${keyword}%` : null)
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .input("TrangThai", sql.NVarChar, trangThai)
    .input("MaXaPhuong", sql.VarChar, maXaPhuong)
    .input("MaTuyenDuong", sql.VarChar, maTuyenDuong)
    .query(`
      SELECT COUNT(1) AS Total
      FROM NguoiDung ND
      WHERE
        (@Keyword IS NULL OR ND.HoTen LIKE @Keyword OR ND.Email LIKE @Keyword OR ND.SDT LIKE @Keyword OR ND.TenDangNhap LIKE @Keyword)
        AND (@MaVaiTro IS NULL OR ND.MaVaiTro = @MaVaiTro)
        AND (@TrangThai IS NULL OR ND.TrangThai = @TrangThai)
        AND (@MaXaPhuong IS NULL OR ND.MaXaPhuong = @MaXaPhuong)
        AND (@MaTuyenDuong IS NULL OR ND.MaTuyenDuong = @MaTuyenDuong)
    `);

  const total = countResult.recordset[0].Total;

  return {
    items: dataResult.recordset,
    pagination: buildPaginationResponse({ page, limit, total })
  };
};

const findUserById = async (maNguoiDung) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .query(`
      SELECT
        ND.MaNguoiDung,
        ND.TenDangNhap,
        ND.HoTen,
        ND.Email,
        ND.SDT,
        ND.TrangThai,
        ND.MaVaiTro,
        VT.TenVaiTro,
        ND.MaXaPhuong,
        ND.MaTuyenDuong,
        ND.DiaChi,
        ND.NgayTao,
        ND.NgayCapNhat
      FROM NguoiDung ND
      LEFT JOIN VaiTro VT ON VT.MaVaiTro = ND.MaVaiTro
      WHERE ND.MaNguoiDung = @MaNguoiDung
    `);

  return result.recordset[0] || null;
};

const findUserByEmail = async (email) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("Email", sql.VarChar, email)
    .query(`
      SELECT *
      FROM NguoiDung
      WHERE Email = @Email
    `);

  return result.recordset[0] || null;
};

const createUser = async (data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, data.maNguoiDung)
    .input("TenDangNhap", sql.VarChar, data.tenDangNhap)
    .input("HoTen", sql.NVarChar, data.hoTen)
    .input("Email", sql.VarChar, data.email)
    .input("SDT", sql.Char, data.sdt || null)
    .input("MatKhauHash", sql.VarChar, data.matKhauHash)
    .input("TrangThai", sql.NVarChar, data.trangThai || "Hoạt động")
    .input("MaVaiTro", sql.VarChar, data.maVaiTro)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("DiaChi", sql.NVarChar, data.diaChi || null)
    .query(`
      INSERT INTO NguoiDung (
        MaNguoiDung,
        TenDangNhap,
        MatKhauHash,
        HoTen,
        Email,
        SDT,
        TrangThai,
        MaVaiTro,
        MaXaPhuong,
        MaTuyenDuong,
        DiaChi,
        NgayTao
      )
      OUTPUT
        INSERTED.MaNguoiDung,
        INSERTED.TenDangNhap,
        INSERTED.HoTen,
        INSERTED.Email,
        INSERTED.SDT,
        INSERTED.TrangThai,
        INSERTED.MaVaiTro,
        INSERTED.MaXaPhuong,
        INSERTED.MaTuyenDuong,
        INSERTED.DiaChi,
        INSERTED.NgayTao
      VALUES (
        @MaNguoiDung,
        @TenDangNhap,
        @MatKhauHash,
        @HoTen,
        @Email,
        @SDT,
        @TrangThai,
        @MaVaiTro,
        @MaXaPhuong,
        @MaTuyenDuong,
        @DiaChi,
        GETDATE()
      )
    `);

  return result.recordset[0];
};

const updateUser = async (maNguoiDung, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .input("TenDangNhap", sql.VarChar, data.tenDangNhap || null)
    .input("HoTen", sql.NVarChar, data.hoTen || null)
    .input("Email", sql.VarChar, data.email || null)
    .input("SDT", sql.Char, data.sdt || null)
    .input("TrangThai", sql.NVarChar, data.trangThai || null)
    .input("MaVaiTro", sql.VarChar, data.maVaiTro || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("DiaChi", sql.NVarChar, data.diaChi || null)
    .query(`
      UPDATE NguoiDung
      SET
        TenDangNhap = COALESCE(@TenDangNhap, TenDangNhap),
        HoTen = COALESCE(@HoTen, HoTen),
        Email = COALESCE(@Email, Email),
        SDT = COALESCE(@SDT, SDT),
        TrangThai = COALESCE(@TrangThai, TrangThai),
        MaVaiTro = COALESCE(@MaVaiTro, MaVaiTro),
        MaXaPhuong = COALESCE(@MaXaPhuong, MaXaPhuong),
        MaTuyenDuong = COALESCE(@MaTuyenDuong, MaTuyenDuong),
        DiaChi = COALESCE(@DiaChi, DiaChi),
        NgayCapNhat = GETDATE()
      WHERE MaNguoiDung = @MaNguoiDung;

      SELECT
        MaNguoiDung,
        TenDangNhap,
        HoTen,
        Email,
        SDT,
        TrangThai,
        MaVaiTro,
        MaXaPhuong,
        MaTuyenDuong,
        DiaChi,
        NgayTao,
        NgayCapNhat
      FROM NguoiDung
      WHERE MaNguoiDung = @MaNguoiDung;
    `);

  return result.recordset[0];
};

const updatePassword = async (maNguoiDung, hashedPassword) => {
  const pool = await getConnection();

  await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .input("MatKhauHash", sql.VarChar, hashedPassword)
    .query(`
      UPDATE NguoiDung
      SET
        MatKhauHash = @MatKhauHash,
        NgayCapNhat = GETDATE()
      WHERE MaNguoiDung = @MaNguoiDung
    `);

  return {
    maNguoiDung
  };
};

const deleteUser = async (maNguoiDung) => {
  const pool = await getConnection();

  await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .query(`
      UPDATE NguoiDung
      SET
        TrangThai = N'Khóa',
        NgayCapNhat = GETDATE()
      WHERE MaNguoiDung = @MaNguoiDung
    `);

  return {
    maNguoiDung
  };
};

module.exports = {
  generateUserId,
  findUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  updatePassword,
  deleteUser
};