const ExcelJS = require("exceljs");

const EXCEL_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

const applyWorksheetStyle = (worksheet) => {
  worksheet.getRow(1).font = {
    bold: true,
    size: 14
  };

  worksheet.getRow(3).font = {
    bold: true,
    color: {
      argb: "FFFFFFFF"
    }
  };

  worksheet.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FF2F5597"
    }
  };

  worksheet.getRow(3).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true
  };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };

      cell.alignment = {
        vertical: "middle",
        wrapText: true
      };
    });
  });

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 3
    }
  ];
};

const buildWorkbookBuffer = async (workbook) => {
  return workbook.xlsx.writeBuffer();
};

/**
 * TREE REPORT EXCEL
 */
const buildTreesExcelReport = async (rows) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Green Tree Management System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Bao cao cay xanh");

  worksheet.mergeCells("A1:P1");
  worksheet.getCell("A1").value = "BÁO CÁO DANH SÁCH CÂY XANH";
  worksheet.getCell("A1").alignment = {
    horizontal: "center"
  };

  worksheet.getCell("A2").value = `Ngày xuất: ${formatDateTime(new Date())}`;

  worksheet.columns = [
    { header: "STT", key: "stt", width: 8 },
    { header: "Mã cây", key: "maCay", width: 18 },
    { header: "Tên cây", key: "tenCayTrong", width: 25 },
    { header: "Loại cây", key: "loaiCay", width: 20 },
    { header: "Ngày trồng", key: "ngayTrong", width: 15 },
    { header: "Nguồn gốc", key: "nguonGoc", width: 25 },
    { header: "Chiều cao hiện tại", key: "chieuCaoHienTai", width: 18 },
    { header: "ĐK thân hiện tại", key: "duongKinhThanHienTai", width: 18 },
    { header: "ĐK tán hiện tại", key: "duongKinhTanHienTai", width: 18 },
    { header: "Trạng thái sức khỏe", key: "trangThaiSucKhoe", width: 22 },
    { header: "Kinh độ", key: "kinhDo", width: 16 },
    { header: "Vĩ độ", key: "viDo", width: 16 },
    { header: "Tuyến đường", key: "tenTuyenDuong", width: 25 },
    { header: "Xã/phường", key: "tenXaPhuong", width: 25 },
    { header: "Ghi chú", key: "ghiChu", width: 35 },
    { header: "Ngày tạo", key: "ngayTao", width: 20 }
  ];

  worksheet.spliceRows(3, 0, worksheet.columns.map((column) => column.header));

  rows.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      maCay: item.MaCay,
      tenCayTrong: item.TenCayTrong,
      loaiCay: item.LoaiCay,
      ngayTrong: formatDate(item.NgayTrong),
      nguonGoc: item.NguonGoc,
      chieuCaoHienTai: item.ChieuCaoHienTai,
      duongKinhThanHienTai: item.DuongKinhThanHienTai,
      duongKinhTanHienTai: item.DuongKinhTanHienTai,
      trangThaiSucKhoe: item.TrangThaiSucKhoe,
      kinhDo: item.KinhDo,
      viDo: item.ViDo,
      tenTuyenDuong: item.TenTuyenDuong,
      tenXaPhuong: item.TenXaPhuong,
      ghiChu: item.GhiChu,
      ngayTao: formatDateTime(item.NgayTao)
    });
  });

  applyWorksheetStyle(worksheet);

  const buffer = await buildWorkbookBuffer(workbook);

  return {
    buffer,
    contentType: EXCEL_CONTENT_TYPE,
    fileName: `bao-cao-cay-xanh-${Date.now()}.xlsx`
  };
};

/**
 * PLAN REPORT EXCEL
 */
const buildPlansExcelReport = async (rows) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Green Tree Management System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Bao cao ke hoach");

  worksheet.mergeCells("A1:O1");
  worksheet.getCell("A1").value = "BÁO CÁO KẾ HOẠCH CÔNG VIỆC";
  worksheet.getCell("A1").alignment = {
    horizontal: "center"
  };

  worksheet.getCell("A2").value = `Ngày xuất: ${formatDateTime(new Date())}`;

  worksheet.columns = [
    { header: "STT", key: "stt", width: 8 },
    { header: "Mã kế hoạch", key: "maKeHoach", width: 18 },
    { header: "Loại công việc", key: "tenCongViec", width: 25 },
    { header: "Tiêu đề", key: "tieuDe", width: 35 },
    { header: "Mô tả", key: "moTa", width: 35 },
    { header: "Trạng thái", key: "trangThai", width: 22 },
    { header: "Người lập", key: "tenNguoiLap", width: 25 },
    { header: "Người phê duyệt", key: "tenNguoiPheDuyet", width: 25 },
    { header: "Ý kiến phê duyệt", key: "yKienPheDuyet", width: 35 },
    { header: "Ngày phê duyệt", key: "ngayPheDuyet", width: 20 },
    { header: "Tuyến đường", key: "tenTuyenDuong", width: 25 },
    { header: "Xã/phường", key: "tenXaPhuong", width: 25 },
    { header: "File kế hoạch", key: "filePDFKeHoach", width: 35 },
    { header: "File đề nghị", key: "filePDFDeNghiCapPhep", width: 35 },
    { header: "Ngày tạo", key: "ngayTao", width: 20 }
  ];

  worksheet.spliceRows(3, 0, worksheet.columns.map((column) => column.header));

  rows.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      maKeHoach: item.MaKeHoach,
      tenCongViec: item.TenCongViec,
      tieuDe: item.TieuDe,
      moTa: item.MoTa,
      trangThai: item.TrangThai,
      tenNguoiLap: item.TenNguoiLap,
      tenNguoiPheDuyet: item.TenNguoiPheDuyet,
      yKienPheDuyet: item.YKienPheDuyet,
      ngayPheDuyet: formatDateTime(item.NgayPheDuyet),
      tenTuyenDuong: item.TenTuyenDuong,
      tenXaPhuong: item.TenXaPhuong,
      filePDFKeHoach: item.FilePDFKeHoach,
      filePDFDeNghiCapPhep: item.FilePDFDeNghiCapPhep,
      ngayTao: formatDateTime(item.NgayTao)
    });
  });

  applyWorksheetStyle(worksheet);

  const buffer = await buildWorkbookBuffer(workbook);

  return {
    buffer,
    contentType: EXCEL_CONTENT_TYPE,
    fileName: `bao-cao-ke-hoach-${Date.now()}.xlsx`
  };
};

/**
 * INCIDENT REPORT EXCEL
 */
const buildIncidentsExcelReport = async (rows) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Green Tree Management System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Bao cao phan anh");

  worksheet.mergeCells("A1:N1");
  worksheet.getCell("A1").value = "BÁO CÁO PHẢN ÁNH SỰ CỐ CÂY XANH";
  worksheet.getCell("A1").alignment = {
    horizontal: "center"
  };

  worksheet.getCell("A2").value = `Ngày xuất: ${formatDateTime(new Date())}`;

  worksheet.columns = [
    { header: "STT", key: "stt", width: 8 },
    { header: "Mã báo cáo", key: "maBaoCao", width: 18 },
    { header: "Người báo cáo", key: "tenNguoiBaoCao", width: 25 },
    { header: "Thời gian báo cáo", key: "thoiGianBaoCao", width: 22 },
    { header: "Loại phản ánh", key: "loaiPhanAnh", width: 30 },
    { header: "Trạng thái xử lý", key: "trangThaiXuLy", width: 22 },
    { header: "Địa chỉ cụ thể", key: "diaChiCuThe", width: 35 },
    { header: "Xã/phường", key: "tenXaPhuong", width: 25 },
    { header: "Người xử lý", key: "tenNguoiXuLy", width: 25 },
    { header: "Số cây liên quan", key: "soLuongCayLienQuan", width: 18 },
    { header: "Mức độ nguy hiểm", key: "mucDoNguyHiemCaoNhat", width: 20 },
    { header: "Trả lời phản hồi", key: "traLoiPhanHoi", width: 40 },
    { header: "File xử lý", key: "pdfDinhKemXuLy", width: 35 },
    { header: "Ngày cập nhật", key: "ngayCapNhat", width: 20 }
  ];

  worksheet.spliceRows(3, 0, worksheet.columns.map((column) => column.header));

  rows.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      maBaoCao: item.MaBaoCao,
      tenNguoiBaoCao: item.TenNguoiBaoCao,
      thoiGianBaoCao: formatDateTime(item.ThoiGianBaoCao),
      loaiPhanAnh: item.LoaiPhanAnh,
      trangThaiXuLy: item.TrangThaiXuLy,
      diaChiCuThe: item.DiaChiCuThe,
      tenXaPhuong: item.TenXaPhuong,
      tenNguoiXuLy: item.TenNguoiXuLy,
      soLuongCayLienQuan: item.SoLuongCayLienQuan,
      mucDoNguyHiemCaoNhat: item.MucDoNguyHiemCaoNhat,
      traLoiPhanHoi: item.TraLoiPhanHoi,
      pdfDinhKemXuLy: item.PDFDinhKemXuLy,
      ngayCapNhat: formatDateTime(item.NgayCapNhat)
    });
  });

  applyWorksheetStyle(worksheet);

  const buffer = await buildWorkbookBuffer(workbook);

  return {
    buffer,
    contentType: EXCEL_CONTENT_TYPE,
    fileName: `bao-cao-phan-anh-${Date.now()}.xlsx`
  };
};

/**
 * ACCEPTANCE RECORD REPORT EXCEL
 */
const buildAcceptanceRecordsExcelReport = async (rows) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Green Tree Management System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Bao cao nghiem thu");

  worksheet.mergeCells("A1:L1");
  worksheet.getCell("A1").value = "BÁO CÁO HỒ SƠ NGHIỆM THU";
  worksheet.getCell("A1").alignment = {
    horizontal: "center"
  };

  worksheet.getCell("A2").value = `Ngày xuất: ${formatDateTime(new Date())}`;

  worksheet.columns = [
    { header: "STT", key: "stt", width: 8 },
    { header: "Mã hồ sơ", key: "maHoSo", width: 18 },
    { header: "Loại công việc", key: "tenCongViec", width: 25 },
    { header: "Tiêu đề", key: "tieuDe", width: 35 },
    { header: "Mô tả", key: "moTa", width: 35 },
    { header: "File PDF", key: "filePDF", width: 35 },
    { header: "Người tạo", key: "tenNguoiTao", width: 25 },
    { header: "Ngày tạo", key: "ngayTao", width: 20 },
    { header: "Người cập nhật", key: "tenNguoiCapNhat", width: 25 },
    { header: "Ngày cập nhật", key: "ngayCapNhat", width: 20 },
    { header: "Xã/phường", key: "tenXaPhuong", width: 25 },
    { header: "Tuyến đường", key: "tenTuyenDuong", width: 25 }
  ];

  worksheet.spliceRows(3, 0, worksheet.columns.map((column) => column.header));

  rows.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      maHoSo: item.MaHoSo,
      tenCongViec: item.TenCongViec,
      tieuDe: item.TieuDe,
      moTa: item.MoTa,
      filePDF: item.FilePDF,
      tenNguoiTao: item.TenNguoiTao,
      ngayTao: formatDateTime(item.NgayTao),
      tenNguoiCapNhat: item.TenNguoiCapNhat,
      ngayCapNhat: formatDateTime(item.NgayCapNhat),
      tenXaPhuong: item.TenXaPhuong,
      tenTuyenDuong: item.TenTuyenDuong
    });
  });

  applyWorksheetStyle(worksheet);

  const buffer = await buildWorkbookBuffer(workbook);

  return {
    buffer,
    contentType: EXCEL_CONTENT_TYPE,
    fileName: `bao-cao-ho-so-nghiem-thu-${Date.now()}.xlsx`
  };
};

module.exports = {
  buildTreesExcelReport,
  buildPlansExcelReport,
  buildIncidentsExcelReport,
  buildAcceptanceRecordsExcelReport
};