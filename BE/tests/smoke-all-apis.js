const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

/**
 * Smoke test toàn bộ API Green Tree Management BE.
 *
 * Cách dùng:
 * 1. Backend đang chạy:
 *    npm run dev
 *
 * 2. Cài thư viện test:
 *    npm install --save-dev axios form-data
 *
 * 3. Đặt file này tại:
 *    tests/smoke-all-apis.js
 *
 * 4. Thêm vào package.json:
 *    "test:api": "node tests/smoke-all-apis.js"
 *
 * 5. Chạy:
 *    npm run test:api
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api/v1";

const TEST_EMAIL = process.env.TEST_EMAIL || "nam@gmail.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "hash123";

const uniqueSuffix = Date.now().toString().slice(-8);

/**
 * Sửa các mã test này cho khớp dữ liệu thật trong DB của bạn.
 */
const ids = {
  maNguoiDung: process.env.TEST_MA_NGUOI_DUNG || "U001",
  maNguoiCapNhat: process.env.TEST_MA_NGUOI_CAP_NHAT || "U003",

  maXaPhuong: process.env.TEST_MA_XA_PHUONG || "P01",
  maTuyenDuong: process.env.TEST_MA_TUYEN_DUONG || "D01",
  maDMCay: process.env.TEST_MA_DM_CAY || "LOAI01",
  maCay: process.env.TEST_MA_CAY || "LVH-C001",

  maLoaiCongViec: process.env.TEST_MA_LOAI_CONG_VIEC || "CV01",

  maBaoCao: process.env.TEST_MA_BAO_CAO || "BC001",
  maKeHoach: process.env.TEST_MA_KE_HOACH || "KH001",
  maKHPC: process.env.TEST_MA_KHPC || "PC001",
  maChiTietPhanCong: process.env.TEST_MA_CHI_TIET_PHAN_CONG || "CTPC001",
  maHoSo: process.env.TEST_MA_HO_SO || "HS001"
};

const files = {
  image: path.resolve("tests/files/test-image.jpg"),
  pdf: path.resolve("tests/files/test.pdf"),
  excel: path.resolve("tests/files/trees-import.xlsx")
};

let accessToken = null;

const runtimeIds = {
  maKeHoachMoi: null,
  maKHPCMoi: null,
  maChiTietPhanCongMoi: null,
  maHoSoMoi: null,
  maVaiTroMoi: null,
  maNguoiDungDangKyMoi: null
};

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  validateStatus: () => true
});

const authHeaders = () => {
  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`
  };
};

const isSuccess = (response) => {
  return response && response.status >= 200 && response.status < 300;
};

const getResponseData = (response) => {
  return response && response.data ? response.data.data : null;
};

const printResult = (name, response) => {
  const ok = response.status >= 200 && response.status < 300;
  const icon = ok ? "PASS" : "FAIL";

  console.log(`[${icon}] ${name}`);
  console.log(`      ${response.config.method.toUpperCase()} ${response.config.url}`);
  console.log(`      Status: ${response.status}`);

  if (!ok) {
    const body = response.data;

    if (Buffer.isBuffer(body)) {
      try {
        const text = body.toString("utf8");

        try {
          console.log("      Error:", JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          console.log("      Error:", text);
        }
      } catch {
        console.log("      Error: Buffer response");
      }
    } else if (typeof body === "object") {
      console.log("      Error:", JSON.stringify(body, null, 2));
    } else {
      console.log("      Error:", body);
    }
  }
};

const request = async (name, config) => {
  try {
    const response = await client.request(config);
    printResult(name, response);
    return response;
  } catch (error) {
    console.log(`[ERROR] ${name}`);
    console.log(`        ${error.message}`);
    return null;
  }
};

const getFileOrSkip = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] Thiếu file ${label}: ${filePath}`);
    return null;
  }

  return fs.createReadStream(filePath);
};

const login = async () => {
  const response = await request("AUTH - Login", {
    method: "POST",
    url: "/auth/login",
    data: {
      email: TEST_EMAIL,
      matKhau: TEST_PASSWORD
    }
  });

  const data = getResponseData(response);

  if (isSuccess(response) && data && data.accessToken) {
    accessToken = data.accessToken;
    console.log("      Token: OK");
  } else {
    console.log("      Token: Không lấy được token. Các API cần auth có thể fail.");
  }
};

const testHealth = async () => {
  await request("SYSTEM - Health", {
    method: "GET",
    url: "/health"
  });
};

const testAuth = async () => {
  await login();

  await request("AUTH - Me", {
    method: "GET",
    url: "/auth/me",
    headers: authHeaders()
  });

  await request("AUTH - Profile", {
    method: "GET",
    url: "/auth/profile",
    headers: authHeaders()
  });

  await request("AUTH - Update profile", {
    method: "PUT",
    url: "/auth/profile",
    headers: authHeaders(),
    data: {
      hoTen: "Nguyễn Văn Nam",
      sdt: "0900000001",
      diaChi: "Địa chỉ test smoke API"
    }
  });

  await request("AUTH - Change password alias", {
    method: "PUT",
    url: "/auth/password",
    headers: authHeaders(),
    data: {
      matKhauCu: TEST_PASSWORD,
      matKhauMoi: TEST_PASSWORD
    }
  });

  const registerResponse = await request("AUTH - Register", {
    method: "POST",
    url: "/auth/register",
    data: {
      tenDangNhap: `test${uniqueSuffix}`,
      hoTen: "Tài khoản Test",
      email: `test${uniqueSuffix}@gmail.com`,
      sdt: "0911111111",
      matKhau: "123456",
      maVaiTro: "CONGNAN",
      maXaPhuong: ids.maXaPhuong,
      maTuyenDuong: ids.maTuyenDuong,
      diaChi: "Địa chỉ đăng ký test"
    }
  });

  const registerData = getResponseData(registerResponse);

  if (isSuccess(registerResponse) && registerData) {
    runtimeIds.maNguoiDungDangKyMoi = registerData.MaNguoiDung || null;
  }
};

const testAdmin = async () => {
  await request("ADMIN - Dashboard", {
    method: "GET",
    url: "/admin/dashboard",
    headers: authHeaders()
  });
};

const testUsers = async () => {
  await request("USERS - List", {
    method: "GET",
    url: "/users",
    headers: authHeaders()
  });

  await request("USERS - Detail", {
    method: "GET",
    url: `/users/${ids.maNguoiDung}`,
    headers: authHeaders()
  });
};

const testRoles = async () => {
  await request("ROLES - List", {
    method: "GET",
    url: "/roles",
    headers: authHeaders()
  });

  const maVaiTroMoi = `T${uniqueSuffix.slice(-4)}`;
  runtimeIds.maVaiTroMoi = maVaiTroMoi;

  const createRoleResponse = await request("ROLES - Create", {
    method: "POST",
    url: "/roles",
    headers: authHeaders(),
    data: {
      maVaiTro: maVaiTroMoi,
      tenVaiTro: "Vai trò test"
    }
  });

  if (isSuccess(createRoleResponse)) {
    await request("ROLES - Detail", {
      method: "GET",
      url: `/roles/${maVaiTroMoi}`,
      headers: authHeaders()
    });

    await request("ROLES - Update", {
      method: "PUT",
      url: `/roles/${maVaiTroMoi}`,
      headers: authHeaders(),
      data: {
        tenVaiTro: "Vai trò test đã cập nhật"
      }
    });

    await request("ROLES - Delete", {
      method: "DELETE",
      url: `/roles/${maVaiTroMoi}`,
      headers: authHeaders()
    });
  } else {
    console.log("[SKIP] ROLES - Detail/Update/Delete: tạo vai trò test không thành công");
  }
};

const testCatalogs = async () => {
  await request("CATALOGS - Tree types", {
    method: "GET",
    url: "/catalogs/tree-types"
  });

  await request("CATALOGS - Work types", {
    method: "GET",
    url: "/catalogs/work-types"
  });

  await request("CATALOGS - Wards", {
    method: "GET",
    url: "/catalogs/wards"
  });

  await request("CATALOGS - Streets", {
    method: "GET",
    url: `/catalogs/streets?maXaPhuong=${encodeURIComponent(ids.maXaPhuong)}`
  });
};

const testTrees = async () => {
  await request("TREES - List", {
    method: "GET",
    url: "/trees"
  });

  await request("TREES - Map", {
    method: "GET",
    url: "/trees/map"
  });

  await request("TREES - Dangerous", {
    method: "GET",
    url: "/trees/dangerous"
  });

  await request("TREES - Detail", {
    method: "GET",
    url: `/trees/${ids.maCay}`
  });

  await request("TREES - Work history", {
    method: "GET",
    url: `/trees/${ids.maCay}/work-history`
  });

  await request("TREES - Create", {
    method: "POST",
    url: "/trees",
    data: {
      maDMCay: ids.maDMCay,
      ngayTrong: "2026-04-01",
      nguonGoc: "Vườn ươm",
      chieuCaoHienTai: 3.5,
      duongKinhThanHienTai: 0.08,
      duongKinhTanHienTai: 1.2,
      trangThaiSucKhoe: "Tốt",
      kinhDo: "108.2208",
      viDo: "16.0471",
      ghiChu: "Test API tạo cây",
      maTuyenDuong: ids.maTuyenDuong,
      maXaPhuong: ids.maXaPhuong,
      maNguoiCapNhat: ids.maNguoiCapNhat
    }
  });

  await request("TREES - Update", {
    method: "PUT",
    url: `/trees/${ids.maCay}`,
    data: {
      chieuCaoHienTai: 4.2,
      duongKinhThanHienTai: 0.1,
      trangThaiSucKhoe: "Tốt",
      ghiChu: "Test cập nhật cây",
      maNguoiCapNhat: ids.maNguoiCapNhat
    }
  });

  await request("TREES - Update location PUT", {
    method: "PUT",
    url: `/trees/${ids.maCay}/location`,
    data: {
      kinhDo: "108.2210",
      viDo: "16.0480",
      lyDoCapNhat: "Test cập nhật vị trí bằng PUT",
      maNguoiCapNhat: ids.maNguoiCapNhat
    }
  });

  await request("TREES - Update location PATCH", {
    method: "PATCH",
    url: `/trees/${ids.maCay}/location`,
    data: {
      kinhDo: "108.2211",
      viDo: "16.0481",
      lyDoCapNhat: "Test cập nhật vị trí bằng PATCH",
      maNguoiCapNhat: ids.maNguoiCapNhat
    }
  });

  await request("TREES - Risk assessment", {
    method: "POST",
    url: `/trees/${ids.maCay}/risk-assessments`,
    data: {
      mucDoNguyHiem: "Cao",
      moTaDanhGia: "Test đánh giá cây nguy hiểm",
      deXuatXuLy: "Cắt tỉa",
      maNguoiCapNhat: ids.maNguoiCapNhat
    }
  });
};

const testTreesImport = async () => {
  const file = getFileOrSkip(files.excel, "Excel import cây");

  if (!file) {
    return;
  }

  const form = new FormData();

  form.append("file", file);
  form.append("maTuyenDuong", ids.maTuyenDuong);
  form.append("maXaPhuong", ids.maXaPhuong);
  form.append("maNguoiCapNhat", ids.maNguoiCapNhat);

  await request("TREES - Import Excel", {
    method: "POST",
    url: "/trees/import",
    headers: form.getHeaders(),
    data: form
  });
};

const testIncidents = async () => {
  await request("INCIDENTS - List", {
    method: "GET",
    url: "/incidents"
  });

  await request("INCIDENTS - My", {
    method: "GET",
    url: `/incidents/my?maNguoiBaoCao=${encodeURIComponent(ids.maNguoiDung)}`
  });

  await request("INCIDENTS - Detail", {
    method: "GET",
    url: `/incidents/${ids.maBaoCao}`
  });

  const image = getFileOrSkip(files.image, "ảnh phản ánh");

  if (image) {
    const form = new FormData();

    form.append("maNguoiBaoCao", ids.maNguoiDung);
    form.append("maXaPhuong", ids.maXaPhuong);
    form.append("diaChiCuThe", "Vị trí test API phản ánh");
    form.append("loaiPhanAnh", "Cây nghiêng nguy hiểm");
    form.append("noiDungPhanAnh", "Test gửi phản ánh sự cố");
    form.append(
      "chiTietBaoCao",
      JSON.stringify([
        {
          maCay: ids.maCay,
          mucDoNguyHiem: "Cao",
          moTaTinhTrang: "Test cây nghiêng"
        }
      ])
    );
    form.append("hinhAnh", image);

    await request("INCIDENTS - Create", {
      method: "POST",
      url: "/incidents",
      headers: form.getHeaders(),
      data: form
    });
  }

  await request("INCIDENTS - Update status", {
    method: "PUT",
    url: `/incidents/${ids.maBaoCao}/status`,
    data: {
      trangThaiXuLy: "Đang xác minh",
      ghiChu: "Test cập nhật trạng thái",
      maNguoiXuLy: ids.maNguoiCapNhat
    }
  });

  await request("INCIDENTS - Reply", {
    method: "PUT",
    url: `/incidents/${ids.maBaoCao}/reply`,
    data: {
      traLoiPhanHoi: "Test phản hồi xử lý",
      maNguoiXuLy: ids.maNguoiCapNhat
    }
  });
};

const testFieldReports = async () => {
  await request("FIELD REPORTS - List", {
    method: "GET",
    url: "/field-reports",
    headers: authHeaders()
  });

  const image = getFileOrSkip(files.image, "ảnh báo cáo hiện trường");

  if (image) {
    const form = new FormData();

    form.append("maNguoiBaoCao", ids.maNguoiDung);
    form.append("maXaPhuong", ids.maXaPhuong);
    form.append("maTuyenDuong", ids.maTuyenDuong);
    form.append("diaChiCuThe", "Vị trí test báo cáo hiện trường");
    form.append("noiDungBaoCao", "Test báo cáo hiện trường");
    form.append(
      "chiTietBaoCao",
      JSON.stringify([
        {
          maCay: ids.maCay,
          moTaTinhTrang: "Test tình trạng hiện trường",
          mucDoNguyHiem: "Thấp"
        }
      ])
    );
    form.append("hinhAnh", image);

    await request("FIELD REPORTS - Create", {
      method: "POST",
      url: "/field-reports",
      headers: {
        ...authHeaders(),
        ...form.getHeaders()
      },
      data: form
    });
  }

  await request("FIELD REPORTS - Update status", {
    method: "PUT",
    url: `/field-reports/${ids.maBaoCao}/status`,
    headers: authHeaders(),
    data: {
      trangThaiXuLy: "Đang xử lý",
      ghiChu: "Test cập nhật báo cáo hiện trường",
      maNguoiXuLy: ids.maNguoiCapNhat
    }
  });
};

const testPlans = async () => {
  await request("PLANS - List", {
    method: "GET",
    url: "/plans"
  });

  await request("PLANS - Statistics alias", {
    method: "GET",
    url: "/plans/statistics"
  });

  await request("PLANS - Statistics export Excel alias", {
    method: "GET",
    url: "/plans/statistics/export?format=excel",
    responseType: "arraybuffer"
  });

  await request("PLANS - Statistics export PDF alias", {
    method: "GET",
    url: "/plans/statistics/export?format=pdf",
    responseType: "arraybuffer"
  });

  await request("PLANS - Detail", {
    method: "GET",
    url: `/plans/${ids.maKeHoach}`
  });

  await request("PLANS - Approval history", {
    method: "GET",
    url: `/plans/${ids.maKeHoach}/approval-history`
  });

  const createPlanResponse = await request("PLANS - Create JSON fallback", {
    method: "POST",
    url: "/plans",
    data: {
      maLoaiCongViec: ids.maLoaiCongViec,
      tieuDe: "Test tạo kế hoạch",
      moTa: "Test API plans",
      maTuyenDuong: ids.maTuyenDuong,
      maXaPhuong: ids.maXaPhuong,
      nguoiLap: ids.maNguoiCapNhat
    }
  });

  const createdPlanData = getResponseData(createPlanResponse);

  if (isSuccess(createPlanResponse) && createdPlanData) {
    runtimeIds.maKeHoachMoi =
      createdPlanData.MaKeHoach ||
      createdPlanData.plan?.MaKeHoach ||
      null;
  }

  if (runtimeIds.maKeHoachMoi) {
    await request("PLANS - Update", {
      method: "PUT",
      url: `/plans/${runtimeIds.maKeHoachMoi}`,
      data: {
        tieuDe: "Test cập nhật kế hoạch",
        moTa: "Test cập nhật từ smoke test"
      }
    });
  } else {
    console.log("[SKIP] PLANS - Update: chưa có mã kế hoạch mới");
  }

  if (runtimeIds.maKeHoachMoi) {
    await request("PLANS - Update status", {
      method: "PUT",
      url: `/plans/${runtimeIds.maKeHoachMoi}/status`,
      data: {
        trangThai: "Đang chờ thẩm định",
        yKienPheDuyet: "Test chuyển trạng thái",
        nguoiPheDuyet: ids.maNguoiCapNhat
      }
    });
  } else {
    console.log("[SKIP] PLANS - Update status: chưa có mã kế hoạch mới");
  }
};

const testAssignments = async () => {
  await request("ASSIGNMENTS - List", {
    method: "GET",
    url: "/assignments"
  });

  await request("ASSIGNMENTS - Detail", {
    method: "GET",
    url: `/assignments/${ids.maKHPC}`
  });

  await request("ASSIGNMENTS - My tasks", {
    method: "GET",
    url: `/assignments/my-tasks?maCongNhan=${encodeURIComponent(ids.maNguoiDung)}`
  });

  await request("ASSIGNMENTS - History alias", {
    method: "GET",
    url: `/assignments/history?maCongNhan=${encodeURIComponent(ids.maNguoiDung)}`
  });

  await request("ASSIGNMENTS - Rework tasks", {
    method: "GET",
    url: `/assignments/rework-tasks?maCongNhan=${encodeURIComponent(ids.maNguoiDung)}`
  });

  const createAssignmentResponse = await request("ASSIGNMENTS - Create", {
    method: "POST",
    url: "/assignments",
    data: {
      maKHCV: ids.maKeHoach,
      tieuDe: "Test phân công",
      nguoiTao: ids.maNguoiCapNhat,
      danhSachCongNhan: JSON.stringify([
        {
          maCongNhan: ids.maNguoiDung,
          congViecCuThe: "Test công việc cụ thể",
          thoiGianBatDau: "2026-04-01T08:00:00",
          thoiGianKetThuc: "2026-04-01T17:00:00",
          yeuCauDanhGia: "Test yêu cầu đánh giá"
        }
      ])
    }
  });

  const createdAssignmentData = getResponseData(createAssignmentResponse);

  if (isSuccess(createAssignmentResponse) && createdAssignmentData) {
    runtimeIds.maKHPCMoi =
      createdAssignmentData.assignment?.MaKHPC ||
      createdAssignmentData.MaKHPC ||
      null;

    runtimeIds.maChiTietPhanCongMoi =
      createdAssignmentData.details?.[0]?.MaChiTiet ||
      null;
  }

  const maChiTietTest = runtimeIds.maChiTietPhanCongMoi || ids.maChiTietPhanCong;

  await request("ASSIGNMENTS - Accept task", {
    method: "PUT",
    url: `/assignments/details/${maChiTietTest}/accept`,
    data: {
      xacNhanNhanViec: true,
      maCongNhan: ids.maNguoiDung
    }
  });

  await request("ASSIGNMENTS - Execute task", {
    method: "PUT",
    url: `/assignments/details/${maChiTietTest}/execute`,
    data: {
      xacNhanHoanTat: true,
      khoiLuongHoanThanh: "Test hoàn thành công việc",
      lyDo: "Test",
      maCongNhan: ids.maNguoiDung
    }
  });

  await request("ASSIGNMENTS - Review task", {
    method: "PUT",
    url: `/assignments/details/${maChiTietTest}/review`,
    data: {
      ketQuaNghiemThuChiTiet: "Đạt",
      yeuCauDanhGia: "Test nghiệm thu đạt",
      nguoiNghiemThu: ids.maNguoiCapNhat
    }
  });

  const maKHPCTest = runtimeIds.maKHPCMoi || ids.maKHPC;

  await request("ASSIGNMENTS - Final review", {
    method: "PUT",
    url: `/assignments/${maKHPCTest}/final-review`,
    data: {
      trangThaiNghiemThu: "Đã nghiệm thu",
      yKienNghiemThu: "Test nghiệm thu toàn bộ",
      nguoiNghiemThu: ids.maNguoiCapNhat
    }
  });
};

const testAcceptanceRecords = async () => {
  await request("ACCEPTANCE - List", {
    method: "GET",
    url: "/acceptance-records"
  });

  const pdf = getFileOrSkip(files.pdf, "PDF nghiệm thu");

  if (pdf) {
    const form = new FormData();

    form.append("maLoaiCongViec", ids.maLoaiCongViec);
    form.append("tieuDe", "Test hồ sơ nghiệm thu");
    form.append("moTa", "Test tạo hồ sơ nghiệm thu");
    form.append("nguoiTao", ids.maNguoiCapNhat);
    form.append("maXaPhuong", ids.maXaPhuong);
    form.append("maTuyenDuong", ids.maTuyenDuong);
    form.append("filePDF", pdf);

    const createAcceptanceResponse = await request("ACCEPTANCE - Create", {
      method: "POST",
      url: "/acceptance-records",
      headers: form.getHeaders(),
      data: form
    });

    const createdAcceptanceData = getResponseData(createAcceptanceResponse);

    if (isSuccess(createAcceptanceResponse) && createdAcceptanceData) {
      runtimeIds.maHoSoMoi = createdAcceptanceData.MaHoSo || null;
    }
  }

  const maHoSoTest = runtimeIds.maHoSoMoi || ids.maHoSo;

  if (!runtimeIds.maHoSoMoi && ids.maHoSo === "HS001") {
    console.log("[SKIP] ACCEPTANCE - Detail: chưa có hồ sơ nghiệm thu test");
    console.log("[SKIP] ACCEPTANCE - Download: chưa có hồ sơ nghiệm thu test");
    return;
  }

  await request("ACCEPTANCE - Detail", {
    method: "GET",
    url: `/acceptance-records/${maHoSoTest}`
  });

  await request("ACCEPTANCE - Download", {
    method: "GET",
    url: `/acceptance-records/${maHoSoTest}/download`,
    responseType: "arraybuffer"
  });
};

const testStatistics = async () => {
  await request("STATISTICS - Overview", {
    method: "GET",
    url: "/statistics/overview"
  });

  await request("STATISTICS - Trees by area", {
    method: "GET",
    url: "/statistics/trees/by-area"
  });

  await request("STATISTICS - Trees by species", {
    method: "GET",
    url: "/statistics/trees/by-species"
  });

  await request("STATISTICS - Dangerous trees", {
    method: "GET",
    url: "/statistics/trees/dangerous"
  });

  await request("STATISTICS - Plans", {
    method: "GET",
    url: "/statistics/plans"
  });

  await request("STATISTICS - Incidents", {
    method: "GET",
    url: "/statistics/incidents"
  });
};

const testReports = async () => {
  await request("REPORTS - Trees Excel", {
    method: "GET",
    url: "/reports/trees/export?format=excel",
    responseType: "arraybuffer"
  });

  await request("REPORTS - Trees PDF", {
    method: "GET",
    url: "/reports/trees/export?format=pdf",
    responseType: "arraybuffer"
  });

  await request("REPORTS - Plans Excel", {
    method: "GET",
    url: "/reports/plans/export?format=excel",
    responseType: "arraybuffer"
  });

  await request("REPORTS - Plans PDF", {
    method: "GET",
    url: "/reports/plans/export?format=pdf",
    responseType: "arraybuffer"
  });

  await request("REPORTS - Incidents Excel", {
    method: "GET",
    url: "/reports/incidents/export?format=excel",
    responseType: "arraybuffer"
  });

  await request("REPORTS - Incidents PDF", {
    method: "GET",
    url: "/reports/incidents/export?format=pdf",
    responseType: "arraybuffer"
  });

  if (runtimeIds.maHoSoMoi || ids.maHoSo !== "HS001") {
    await request("REPORTS - Acceptance Excel", {
      method: "GET",
      url: "/reports/acceptance/export?format=excel",
      responseType: "arraybuffer"
    });

    await request("REPORTS - Acceptance PDF", {
      method: "GET",
      url: "/reports/acceptance/export?format=pdf",
      responseType: "arraybuffer"
    });
  } else {
    console.log("[SKIP] REPORTS - Acceptance Excel: chưa có hồ sơ nghiệm thu");
    console.log("[SKIP] REPORTS - Acceptance PDF: chưa có hồ sơ nghiệm thu");
  }
};

const main = async () => {
  console.log("====================================");
  console.log("GREEN TREE API SMOKE TEST");
  console.log("BASE_URL:", BASE_URL);
  console.log("====================================");

  await testHealth();
  await testAuth();

  await testAdmin();
  await testUsers();
  await testRoles();

  await testCatalogs();
  await testTrees();
  await testTreesImport();

  await testIncidents();
  await testFieldReports();

  await testPlans();
  await testAssignments();

  await testAcceptanceRecords();

  await testStatistics();
  await testReports();

  console.log("====================================");
  console.log("DONE");
  console.log("====================================");
};

main().catch((error) => {
  console.error("Smoke test crashed:", error);
  process.exit(1);
});