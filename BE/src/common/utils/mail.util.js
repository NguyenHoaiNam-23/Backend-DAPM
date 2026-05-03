const nodemailer = require("nodemailer");

const AppError = require("../errors/AppError");

const getSmtpConfig = () => {
  const requiredKeys = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM"
  ];

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new AppError(
      `Cau hinh SMTP chua day du: ${missingKeys.join(", ")}`,
      500
    );
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new AppError("Thong tin gui email khong hop le", 400);
  }

  const transporter = nodemailer.createTransport(getSmtpConfig());

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  });
};

module.exports = {
  sendEmail
};
