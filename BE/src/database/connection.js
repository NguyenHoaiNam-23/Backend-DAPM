const sql = require("mssql");
const dbConfig = require("../config/database.config");

let pool;

const connectDatabase = async () => {
  if (pool) {
    return pool;
  }

  pool = await sql.connect(dbConfig);
  console.log("Connected to SQL Server");

  return pool;
};

const getConnection = async () => {
  if (!pool) {
    pool = await connectDatabase();
  }

  return pool;
};

module.exports = {
  sql,
  connectDatabase,
  getConnection
};