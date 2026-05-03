const { getConnection, sql } = require("../../database/connection");

const findRoles = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      MaVaiTro,
      TenVaiTro
    FROM VaiTro
    ORDER BY MaVaiTro ASC
  `);

  return result.recordset;
};

const findRoleById = async (maVaiTro) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .query(`
      SELECT
        MaVaiTro,
        TenVaiTro
      FROM VaiTro
      WHERE MaVaiTro = @MaVaiTro
    `);

  return result.recordset[0] || null;
};

const createRole = async (data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaVaiTro", sql.VarChar, data.maVaiTro)
    .input("TenVaiTro", sql.NVarChar, data.tenVaiTro)
    .query(`
      INSERT INTO VaiTro (
        MaVaiTro,
        TenVaiTro
      )
      OUTPUT INSERTED.*
      VALUES (
        @MaVaiTro,
        @TenVaiTro
      )
    `);

  return result.recordset[0];
};

const updateRole = async (maVaiTro, data) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .input("TenVaiTro", sql.NVarChar, data.tenVaiTro)
    .query(`
      UPDATE VaiTro
      SET TenVaiTro = @TenVaiTro
      WHERE MaVaiTro = @MaVaiTro;

      SELECT
        MaVaiTro,
        TenVaiTro
      FROM VaiTro
      WHERE MaVaiTro = @MaVaiTro;
    `);

  return result.recordset[0] || null;
};

const deleteRole = async (maVaiTro) => {
  const pool = await getConnection();

  await pool.request()
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .query(`
      DELETE FROM VaiTro
      WHERE MaVaiTro = @MaVaiTro
    `);

  return {
    maVaiTro
  };
};

const countUsersByRole = async (maVaiTro) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input("MaVaiTro", sql.VarChar, maVaiTro)
    .query(`
      SELECT COUNT(1) AS Total
      FROM NguoiDung
      WHERE MaVaiTro = @MaVaiTro
    `);

  return result.recordset[0].Total || 0;
};

module.exports = {
  findRoles,
  findRoleById,
  createRole,
  updateRole,
  deleteRole,
  countUsersByRole
};