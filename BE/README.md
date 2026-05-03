# Green Tree Management BE

Backend API cho hệ thống quản lý cây xanh đô thị. Dự án cung cấp API quản lý hồ sơ cây, danh mục, vai trò, người dùng, phản ánh sự cố, báo cáo hiện trường, kế hoạch công việc, phân công, nghiệm thu, thống kê và xuất báo cáo Excel/PDF.

## Công nghệ sử dụng

- Node.js, Express 5
- SQL Server, `mssql`
- JWT authentication, phân quyền theo vai trò
- `multer` cho upload file
- `exceljs` cho import/export Excel
- `pdfkit` cho xuất PDF
- `joi` cho validate dữ liệu
- `helmet`, `cors`, `morgan` cho bảo mật và logging cơ bản

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm
- SQL Server đang chạy và có database phù hợp với các bảng repository đang truy vấn

Repository hiện chưa có migration/seed database, vì vậy cần chuẩn bị sẵn database SQL Server trước khi chạy API.

## Cài đặt

```bash
npm install
```

Tạo file môi trường từ file mẫu:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

## Cấu hình môi trường

File `.env.example` hiện có các biến chính:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=123456789
DB_NAME=QuanLyCayXanhDN
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Các biến tùy chọn khác được code hỗ trợ:

```env
JWT_SECRET=green_tree_secret_key
JWT_EXPIRES_IN=1d

UPLOAD_ROOT=src/uploads
MAX_FILE_SIZE_MB=10
```

## Chạy dự án

Chạy development với `nodemon`:

```bash
npm run dev
```

Chạy production/local bình thường:

```bash
npm start
```

Mặc định server chạy tại:

```text
http://localhost:5000
```

Base API:

```text
http://localhost:5000/api/v1
```

Kiểm tra health check:

```bash
curl http://localhost:5000/api/v1/health
```

Response mẫu:

```json
{
  "success": true,
  "message": "Backend API is running",
  "data": {
    "service": "Green Tree Management BE"
  }
}
```

## Scripts

| Lệnh | Mô tả |
| --- | --- |
| `npm start` | Chạy server bằng `node src/server.js` |
| `npm run dev` | Chạy server development bằng `nodemon` |
| `npm run test:api` | Chạy smoke test toàn bộ API trong `tests/smoke-all-apis.js` |

## Cấu trúc thư mục

```text
src/
  app.js                         # Khởi tạo Express app và middleware
  server.js                      # Kết nối DB và start server
  routes/                        # Gắn route tổng /api/v1
  config/                        # Cấu hình app, database, jwt, upload
  database/                      # Kết nối SQL Server
  common/
    errors/                      # AppError
    middlewares/                 # auth, error, upload, async handler
    responses/                   # Response helpers
    utils/                       # Tiện ích phân trang, tạo id
  modules/
    auth/                        # Đăng nhập, profile, đổi mật khẩu
    users/                       # Quản lý người dùng
    roles/                       # Quản lý vai trò người dùng
    admin/                       # Dashboard admin
    catalogs/                    # Danh mục cây, công việc, phường, đường
    trees/                       # Hồ sơ cây, bản đồ, import Excel, đánh giá rủi ro
    incidents/                   # Phản ánh sự cố từ người dân
    field-reports/               # Báo cáo hiện trường
    plans/                       # Kế hoạch công việc và phê duyệt
    assignments/                 # Phân công, thực hiện, nghiệm thu
    acceptance-records/          # Hồ sơ nghiệm thu
    statistics/                  # Thống kê
    reports/                     # Xuất Excel/PDF
```

Mỗi module thường đi theo cấu trúc:

```text
*.routes.js       # Khai báo endpoint
*.controller.js   # Nhận request/response
*.service.js      # Xử lý nghiệp vụ
*.repository.js   # Truy vấn SQL Server
*.validator.js    # Validate dữ liệu đầu vào nếu có
```

## Xác thực và phân quyền

Các API cần đăng nhập sử dụng JWT Bearer token:

```http
Authorization: Bearer <accessToken>
```

Đăng nhập:

```http
POST /api/v1/auth/login
```

Body mẫu:

```json
{
  "email": "nam@gmail.com",
  "matKhau": "hash123"
}
```

Một số route có phân quyền theo vai trò, ví dụ:

- `ADMIN`
- `CANBO`
- `QUAN_LY`
- `NVKT`
- `CONGNAN`

Module `roles` dùng để quản lý bảng vai trò. Các API xem danh sách/chi tiết vai trò yêu cầu `ADMIN` hoặc `CANBO`; các API tạo, sửa, xóa vai trò yêu cầu `ADMIN`. Không thể xóa vai trò đang được gán cho người dùng.

## Response format

Response thành công:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "errors": []
}
```

## API endpoints chính

Tất cả endpoint bên dưới đều có prefix `/api/v1`.

### System

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/health` | Kiểm tra trạng thái API |

### Auth

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/auth/login` | Đăng nhập |
| `POST` | `/auth/register` | Đăng ký tài khoản |
| `GET` | `/auth/me` | Lấy thông tin người dùng hiện tại |
| `GET` | `/auth/profile` | Alias lấy thông tin tài khoản hiện tại |
| `PUT` | `/auth/profile` | Cập nhật thông tin tài khoản hiện tại |
| `PUT` | `/auth/change-password` | Đổi mật khẩu |
| `PUT` | `/auth/password` | Alias đổi mật khẩu |

### Users

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/users` | Danh sách người dùng |
| `GET` | `/users/:maNguoiDung` | Chi tiết người dùng |
| `POST` | `/users` | Tạo người dùng |
| `PUT` | `/users/:maNguoiDung` | Cập nhật người dùng |
| `PUT` | `/users/:maNguoiDung/reset-password` | Reset mật khẩu |
| `DELETE` | `/users/:maNguoiDung` | Xóa người dùng |

### Admin

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Thống kê dashboard quản trị |

### Roles

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/roles` | Danh sách vai trò |
| `GET` | `/roles/:maVaiTro` | Chi tiết vai trò |
| `POST` | `/roles` | Tạo vai trò |
| `PUT` | `/roles/:maVaiTro` | Cập nhật vai trò |
| `DELETE` | `/roles/:maVaiTro` | Xóa vai trò |

### Catalogs

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/catalogs/tree-types` | Danh sách loại cây |
| `GET` | `/catalogs/tree-types/:maDMCay` | Chi tiết loại cây |
| `POST` | `/catalogs/tree-types` | Tạo loại cây |
| `PUT` | `/catalogs/tree-types/:maDMCay` | Cập nhật loại cây |
| `DELETE` | `/catalogs/tree-types/:maDMCay` | Xóa loại cây |
| `GET` | `/catalogs/work-types` | Danh sách loại công việc |
| `GET` | `/catalogs/work-types/:maLoaiCongViec` | Chi tiết loại công việc |
| `POST` | `/catalogs/work-types` | Tạo loại công việc |
| `PUT` | `/catalogs/work-types/:maLoaiCongViec` | Cập nhật loại công việc |
| `DELETE` | `/catalogs/work-types/:maLoaiCongViec` | Xóa loại công việc |
| `GET` | `/catalogs/wards` | Danh sách xã/phường |
| `GET` | `/catalogs/wards/:maXaPhuong` | Chi tiết xã/phường |
| `POST` | `/catalogs/wards` | Tạo xã/phường |
| `PUT` | `/catalogs/wards/:maXaPhuong` | Cập nhật xã/phường |
| `DELETE` | `/catalogs/wards/:maXaPhuong` | Xóa xã/phường |
| `GET` | `/catalogs/streets` | Danh sách tuyến đường |
| `GET` | `/catalogs/streets/:maTuyenDuong` | Chi tiết tuyến đường |
| `POST` | `/catalogs/streets` | Tạo tuyến đường |
| `PUT` | `/catalogs/streets/:maTuyenDuong` | Cập nhật tuyến đường |
| `DELETE` | `/catalogs/streets/:maTuyenDuong` | Xóa tuyến đường |

### Trees

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/trees` | Danh sách cây, hỗ trợ phân trang/lọc/tìm kiếm |
| `GET` | `/trees/map` | Danh sách cây cho bản đồ |
| `GET` | `/trees/dangerous` | Danh sách cây nguy hiểm |
| `GET` | `/trees/:maCay` | Chi tiết cây |
| `POST` | `/trees` | Tạo hồ sơ cây |
| `POST` | `/trees/import` | Import cây từ Excel |
| `PUT` | `/trees/:maCay` | Cập nhật hồ sơ cây |
| `PUT` | `/trees/:maCay/location` | Cập nhật vị trí cây |
| `PATCH` | `/trees/:maCay/location` | Alias cập nhật vị trí cây |
| `PUT` | `/trees/:maCay/archive` | Lưu trữ/xóa mềm cây |
| `POST` | `/trees/:maCay/risk-assessments` | Tạo đánh giá nguy hiểm |
| `GET` | `/trees/:maCay/work-history` | Lịch sử công việc/phản ánh liên quan |

### Incidents

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/incidents` | Người dân gửi phản ánh sự cố |
| `GET` | `/incidents/my` | Người dân xem phản ánh của mình |
| `GET` | `/incidents` | Danh sách phản ánh |
| `GET` | `/incidents/:maBaoCao` | Chi tiết phản ánh |
| `PUT` | `/incidents/:maBaoCao/status` | Cập nhật trạng thái xử lý |
| `PUT` | `/incidents/:maBaoCao/reject` | Từ chối phản ánh |
| `PUT` | `/incidents/:maBaoCao/reply` | Phản hồi kết quả xử lý |

### Field reports

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/field-reports` | Tạo báo cáo hiện trường |
| `GET` | `/field-reports` | Danh sách báo cáo hiện trường |
| `PUT` | `/field-reports/:maBaoCao/status` | Cập nhật trạng thái báo cáo |

### Plans

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/plans` | Danh sách kế hoạch |
| `GET` | `/plans/statistics` | Alias thống kê kế hoạch |
| `GET` | `/plans/statistics/export` | Alias xuất thống kê kế hoạch Excel/PDF |
| `GET` | `/plans/:maKeHoach` | Chi tiết kế hoạch |
| `GET` | `/plans/:maKeHoach/approval-history` | Lịch sử phê duyệt |
| `POST` | `/plans` | Tạo kế hoạch |
| `PUT` | `/plans/:maKeHoach` | Cập nhật kế hoạch |
| `PUT` | `/plans/:maKeHoach/cancel` | Hủy kế hoạch |
| `PUT` | `/plans/:maKeHoach/status` | Cập nhật trạng thái/phê duyệt |

### Assignments

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/assignments` | Tạo kế hoạch phân công |
| `GET` | `/assignments` | Danh sách phân công |
| `GET` | `/assignments/my-tasks` | Công nhân xem việc được giao |
| `GET` | `/assignments/history` | Alias lịch sử/công việc được giao |
| `GET` | `/assignments/rework-tasks` | Công nhân xem việc cần làm lại |
| `GET` | `/assignments/:maKHPC` | Chi tiết phân công |
| `PUT` | `/assignments/details/:maChiTiet/accept` | Xác nhận nhận việc |
| `PUT` | `/assignments/details/:maChiTiet/execute` | Cập nhật kết quả thực hiện |
| `PUT` | `/assignments/details/:maChiTiet/review` | Nghiệm thu chi tiết |
| `PUT` | `/assignments/details/:maChiTiet/rework` | Gửi lại kết quả làm lại |
| `PUT` | `/assignments/:maKHPC/final-review` | Nghiệm thu toàn bộ phân công |

### Acceptance records

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/acceptance-records` | Tạo hồ sơ nghiệm thu |
| `GET` | `/acceptance-records` | Danh sách hồ sơ nghiệm thu |
| `GET` | `/acceptance-records/:maHoSo` | Chi tiết hồ sơ nghiệm thu |
| `GET` | `/acceptance-records/:maHoSo/download` | Tải file hồ sơ nghiệm thu |
| `PUT` | `/acceptance-records/:maHoSo` | Cập nhật hồ sơ nghiệm thu |
| `DELETE` | `/acceptance-records/:maHoSo` | Xóa hồ sơ nghiệm thu |

### Statistics

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/statistics/overview` | Thống kê tổng quan |
| `GET` | `/statistics/trees/by-area` | Thống kê cây theo khu vực |
| `GET` | `/statistics/trees/by-species` | Thống kê cây theo loài |
| `GET` | `/statistics/trees/dangerous` | Thống kê cây nguy hiểm |
| `GET` | `/statistics/plans` | Thống kê kế hoạch |
| `GET` | `/statistics/incidents` | Thống kê phản ánh |

### Reports

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/reports/trees/export?format=excel` | Xuất báo cáo cây Excel |
| `GET` | `/reports/trees/export?format=pdf` | Xuất báo cáo cây PDF |
| `GET` | `/reports/plans/export?format=excel` | Xuất báo cáo kế hoạch Excel |
| `GET` | `/reports/plans/export?format=pdf` | Xuất báo cáo kế hoạch PDF |
| `GET` | `/reports/incidents/export?format=excel` | Xuất báo cáo phản ánh Excel |
| `GET` | `/reports/incidents/export?format=pdf` | Xuất báo cáo phản ánh PDF |
| `GET` | `/reports/acceptance/export?format=excel` | Xuất báo cáo nghiệm thu Excel |
| `GET` | `/reports/acceptance/export?format=pdf` | Xuất báo cáo nghiệm thu PDF |

## Upload file

Thư mục upload mặc định:

```text
src/uploads
```

Các nhóm upload chính:

| Nhóm | Field | Định dạng |
| --- | --- | --- |
| Import cây | `file` | `.xlsx`, `.xls` |
| Ảnh phản ánh | `hinhAnh` | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Phản hồi phản ánh | `pdfDinhKemXuLy` | ảnh hoặc `.pdf` |
| Kế hoạch | `filePDFKeHoach`, `filePDFDeNghiCapPhep` | `.pdf`, `.doc`, `.docx` |
| Phê duyệt kế hoạch | `filePDFBoSungKeHoach` | `.pdf`, `.doc`, `.docx` |
| Phân công | `filePDF`, `anhTruoc`, `anhSau` | ảnh, `.pdf`, `.doc`, `.docx` |
| Hồ sơ nghiệm thu | `filePDF` | `.pdf`, `.doc`, `.docx` |

Giới hạn dung lượng mặc định là `10MB/file`, có thể đổi bằng `MAX_FILE_SIZE_MB`.

## Smoke test API

File smoke test nằm tại:

```text
tests/smoke-all-apis.js
```

Chạy server trước:

```bash
npm run dev
```

Sau đó chạy test:

```bash
npm run test:api
```

Smoke test dùng các biến môi trường tùy chọn sau để khớp dữ liệu thật trong database:

```env
API_BASE_URL=http://localhost:5000/api/v1
TEST_EMAIL=nam@gmail.com
TEST_PASSWORD=hash123
TEST_MA_NGUOI_DUNG=U001
TEST_MA_NGUOI_CAP_NHAT=U003
TEST_MA_XA_PHUONG=P01
TEST_MA_TUYEN_DUONG=D01
TEST_MA_DM_CAY=LOAI01
TEST_MA_CAY=LVH-C001
TEST_MA_LOAI_CONG_VIEC=CV01
TEST_MA_BAO_CAO=BC001
TEST_MA_KE_HOACH=KH001
TEST_MA_KHPC=PC001
TEST_MA_CHI_TIET_PHAN_CONG=CTPC001
TEST_MA_HO_SO=HS001
```

Một số test upload sẽ tự bỏ qua nếu thiếu file trong `tests/files`.

## Lưu ý phát triển

- API được mount tại `/api/v1`.
- Server chỉ start sau khi kết nối SQL Server thành công.
- Các file upload được tạo thư mục tự động khi khởi động middleware upload.
- Các API có phân trang thường dùng query `page` và `limit`.
- Không commit `.env`, `node_modules` hoặc file upload tạm.
