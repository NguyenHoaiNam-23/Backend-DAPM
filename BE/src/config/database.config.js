require("dotenv").config();

module.exports = {
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
  }
};