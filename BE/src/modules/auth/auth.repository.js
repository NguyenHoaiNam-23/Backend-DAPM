const { getConnection, sql } = require("../../database/connection");
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

const findUserByEmail = async (email) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("Email", sql.VarChar, email)
    .query(`
      SELECT
        ND.MaNguoiDung,
        ND.TenDangNhap,
        ND.MatKhauHash,
        ND.HoTen,
        ND.Email,
        ND.SDT,
        ND.TrangThai,
        ND.MaXaPhuong,
        ND.MaTuyenDuong,
        ND.DiaChi,
        ND.MaVaiTro,
        VT.TenVaiTro,
        ND.NgayTao,
        ND.NgayCapNhat
      FROM NguoiDung ND
      LEFT JOIN VaiTro VT ON VT.MaVaiTro = ND.MaVaiTro
      WHERE ND.Email = @Email
    `);

  return result.recordset[0] || null;
};

const findUserByUsername = async (tenDangNhap) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("TenDangNhap", sql.VarChar, tenDangNhap)
    .query(`
      SELECT *
      FROM NguoiDung
      WHERE TenDangNhap = @TenDangNhap
    `);

  return result.recordset[0] || null;
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
        ND.MaXaPhuong,
        ND.MaTuyenDuong,
        ND.DiaChi,
        ND.MaVaiTro,
        VT.TenVaiTro,
        ND.NgayTao,
        ND.NgayCapNhat
      FROM NguoiDung ND
      LEFT JOIN VaiTro VT ON VT.MaVaiTro = ND.MaVaiTro
      WHERE ND.MaNguoiDung = @MaNguoiDung
    `);

  return result.recordset[0] || null;
};

const createUser = async (data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, data.maNguoiDung)
    .input("TenDangNhap", sql.VarChar, data.tenDangNhap)
    .input("MatKhauHash", sql.VarChar, data.matKhauHash)
    .input("HoTen", sql.NVarChar, data.hoTen)
    .input("Email", sql.VarChar, data.email)
    .input("SDT", sql.Char, data.sdt || null)
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

const updateProfile = async (maNguoiDung, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaNguoiDung", sql.VarChar, maNguoiDung)
    .input("HoTen", sql.NVarChar, data.hoTen || null)
    .input("Email", sql.VarChar, data.email || null)
    .input("SDT", sql.Char, data.sdt || null)
    .input("MaXaPhuong", sql.VarChar, data.maXaPhuong || null)
    .input("MaTuyenDuong", sql.VarChar, data.maTuyenDuong || null)
    .input("DiaChi", sql.NVarChar, data.diaChi || null)
    .query(`
      UPDATE NguoiDung
      SET
        HoTen = COALESCE(@HoTen, HoTen),
        Email = COALESCE(@Email, Email),
        SDT = COALESCE(@SDT, SDT),
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

  return result.recordset[0] || null;
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

  return true;
};

module.exports = {
  generateUserId,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateProfile,
  updatePassword
};