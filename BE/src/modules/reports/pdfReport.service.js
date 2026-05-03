const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const PDF_CONTENT_TYPE = "application/pdf";

const REGULAR_FONT_PATH = path.resolve("src/assets/fonts/Roboto-Regular.ttf");
const BOLD_FONT_PATH = path.resolve("src/assets/fonts/Roboto-Bold.ttf");

const registerFonts = (doc) => {
  try {
    const hasRegularFont = fs.existsSync(REGULAR_FONT_PATH);
    const hasBoldFont = fs.existsSync(BOLD_FONT_PATH);

    if (hasRegularFont && hasBoldFont) {
      doc.registerFont("AppRegular", REGULAR_FONT_PATH);
      doc.registerFont("AppBold", BOLD_FONT_PATH);

      return {
        regular: "AppRegular",
        bold: "AppBold",
        vietnamese: true
      };
    }
  } catch (error) {
    console.warn("Không thể load font tiếng Việt, dùng Helvetica:", error.message);
  }

  return {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    vietnamese: false
  };
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("vi-VN");
};

const normalizeText = (value, useVietnameseFont) => {
  const text = String(value ?? "");

  if (useVietnameseFont) {
    return text;
  }

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const buildPdfBuffer = (title, columns, rows) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30
    });

    const fonts = registerFonts(doc);

    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.font(fonts.bold);
    doc.fontSize(16).text(normalizeText(title, fonts.vietnamese), {
      align: "center"
    });

    doc.moveDown(0.5);

    doc.font(fonts.regular);
    doc.fontSize(9).text(
      normalizeText(`Ngày xuất: ${formatDateTime(new Date())}`, fonts.vietnamese),
      {
        align: "right"
      }
    );

    doc.moveDown();

    const startX = doc.x;
    let currentY = doc.y;
    const rowHeight = 30;

    const totalWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const columnWidth = totalWidth / columns.length;

    const drawRow = (values, isHeader = false) => {
      let currentX = startX;

      values.forEach((value) => {
        doc.rect(currentX, currentY, columnWidth, rowHeight).stroke();

        if (isHeader) {
          doc.font(fonts.bold);
          doc.fontSize(8);
        } else {
          doc.font(fonts.regular);
          doc.fontSize(7);
        }

        doc.text(
          normalizeText(value, fonts.vietnamese),
          currentX + 3,
          currentY + 5,
          {
            width: columnWidth - 6,
            height: rowHeight - 8,
            ellipsis: true
          }
        );

        currentX += columnWidth;
      });

      currentY += rowHeight;

      if (currentY > doc.page.height - doc.page.margins.bottom - rowHeight) {
        doc.addPage({
          size: "A4",
          layout: "landscape",
          margin: 30
        });

        currentY = doc.page.margins.top;
      }
    };

    drawRow(columns.map((column) => column.header), true);

    rows.forEach((row, index) => {
      const values = columns.map((column) => {
        if (column.key === "stt") {
          return index + 1;
        }

        return row[column.key];
      });

      drawRow(values, false);
    });

    doc.end();
  });
};

const buildTreesPdfReport = async (rows) => {
  const normalizedRows = rows.map((item) => ({
    maCay: item.MaCay,
    tenCayTrong: item.TenCayTrong,
    trangThaiSucKhoe: item.TrangThaiSucKhoe,
    tenTuyenDuong: item.TenTuyenDuong,
    tenXaPhuong: item.TenXaPhuong,
    ngayTrong: formatDate(item.NgayTrong)
  }));

  const columns = [
    { header: "STT", key: "stt" },
    { header: "Mã cây", key: "maCay" },
    { header: "Tên cây", key: "tenCayTrong" },
    { header: "Sức khỏe", key: "trangThaiSucKhoe" },
    { header: "Tuyến đường", key: "tenTuyenDuong" },
    { header: "Xã/phường", key: "tenXaPhuong" },
    { header: "Ngày trồng", key: "ngayTrong" }
  ];

  const buffer = await buildPdfBuffer(
    "BÁO CÁO DANH SÁCH CÂY XANH",
    columns,
    normalizedRows
  );

  return {
    buffer,
    contentType: PDF_CONTENT_TYPE,
    fileName: `bao-cao-cay-xanh-${Date.now()}.pdf`
  };
};

const buildPlansPdfReport = async (rows) => {
  const normalizedRows = rows.map((item) => ({
    maKeHoach: item.MaKeHoach,
    tenCongViec: item.TenCongViec,
    tieuDe: item.TieuDe,
    trangThai: item.TrangThai,
    tenNguoiLap: item.TenNguoiLap,
    tenTuyenDuong: item.TenTuyenDuong,
    tenXaPhuong: item.TenXaPhuong,
    ngayTao: formatDate(item.NgayTao)
  }));

  const columns = [
    { header: "STT", key: "stt" },
    { header: "Mã KH", key: "maKeHoach" },
    { header: "Công việc", key: "tenCongViec" },
    { header: "Tiêu đề", key: "tieuDe" },
    { header: "Trạng thái", key: "trangThai" },
    { header: "Người lập", key: "tenNguoiLap" },
    { header: "Tuyến đường", key: "tenTuyenDuong" },
    { header: "Ngày tạo", key: "ngayTao" }
  ];

  const buffer = await buildPdfBuffer(
    "BÁO CÁO KẾ HOẠCH CÔNG VIỆC",
    columns,
    normalizedRows
  );

  return {
    buffer,
    contentType: PDF_CONTENT_TYPE,
    fileName: `bao-cao-ke-hoach-${Date.now()}.pdf`
  };
};

const buildIncidentsPdfReport = async (rows) => {
  const normalizedRows = rows.map((item) => ({
    maBaoCao: item.MaBaoCao,
    thoiGianBaoCao: formatDate(item.ThoiGianBaoCao),
    loaiPhanAnh: item.LoaiPhanAnh,
    trangThaiXuLy: item.TrangThaiXuLy,
    tenXaPhuong: item.TenXaPhuong,
    soLuongCayLienQuan: item.SoLuongCayLienQuan,
    mucDoNguyHiemCaoNhat: item.MucDoNguyHiemCaoNhat
  }));

  const columns = [
    { header: "STT", key: "stt" },
    { header: "Mã BC", key: "maBaoCao" },
    { header: "Ngày BC", key: "thoiGianBaoCao" },
    { header: "Loại PA", key: "loaiPhanAnh" },
    { header: "Trạng thái", key: "trangThaiXuLy" },
    { header: "Xã/phường", key: "tenXaPhuong" },
    { header: "Số cây", key: "soLuongCayLienQuan" },
    { header: "Mức độ", key: "mucDoNguyHiemCaoNhat" }
  ];

  const buffer = await buildPdfBuffer(
    "BÁO CÁO PHẢN ÁNH SỰ CỐ CÂY XANH",
    columns,
    normalizedRows
  );

  return {
    buffer,
    contentType: PDF_CONTENT_TYPE,
    fileName: `bao-cao-phan-anh-${Date.now()}.pdf`
  };
};

const buildAcceptanceRecordsPdfReport = async (rows) => {
  const normalizedRows = rows.map((item) => ({
    maHoSo: item.MaHoSo,
    tenCongViec: item.TenCongViec,
    tieuDe: item.TieuDe,
    tenNguoiTao: item.TenNguoiTao,
    ngayTao: formatDate(item.NgayTao),
    tenXaPhuong: item.TenXaPhuong,
    tenTuyenDuong: item.TenTuyenDuong
  }));

  const columns = [
    { header: "STT", key: "stt" },
    { header: "Mã HS", key: "maHoSo" },
    { header: "Công việc", key: "tenCongViec" },
    { header: "Tiêu đề", key: "tieuDe" },
    { header: "Người tạo", key: "tenNguoiTao" },
    { header: "Ngày tạo", key: "ngayTao" },
    { header: "Xã/phường", key: "tenXaPhuong" },
    { header: "Tuyến đường", key: "tenTuyenDuong" }
  ];

  const buffer = await buildPdfBuffer(
    "BÁO CÁO HỒ SƠ NGHIỆM THU",
    columns,
    normalizedRows
  );

  return {
    buffer,
    contentType: PDF_CONTENT_TYPE,
    fileName: `bao-cao-ho-so-nghiem-thu-${Date.now()}.pdf`
  };
};

module.exports = {
  buildTreesPdfReport,
  buildPlansPdfReport,
  buildIncidentsPdfReport,
  buildAcceptanceRecordsPdfReport
};