# Backend Progress Handover

## Project Overview

- [x] Green Tree Management la he thong quan ly cay xanh do thi, xu ly van hanh cay, su co, ke hoach, phan cong va bao cao.
- [x] Stack chinh: Node.js, Express, SQL Server, JWT.
- [x] Kien truc hien tai theo huong N-Tier: routes -> controllers -> services -> repositories -> SQL Server.

## Current Status

- [x] Auth module PASS 100%.
- [x] Users module PASS 100%.
- [x] Trees module PASS 100%, bao gom CRUD, map, risk assessment va import Excel.
- [x] Incidents module PASS 100%.
- [x] Plans module PASS 100%, bao gom state machine.
- [x] Assignments module PASS 100%.
- [x] Statistics module PASS 100%.
- [x] Reports module PASS 100%, bao gom PDF/Excel.
- [x] Task 1.1 hoan thanh: cau hinh mail utility voi Nodemailer va bien SMTP trong `.env.example`.
- [x] Task 1.2 hoan thanh: bo sung module `files` va API `GET /api/v1/files/:filename`.
- [x] Task 1.3 hoan thanh: tach `catalogs` thanh 4 sub-modules `treeType`, `workType`, `ward`, `street` nhung van giu nguyen endpoint smoke test.

## Database State

- [x] Du an su dung trigger va logic nghiep vu truc tiep trong SQL Server, can ton trong tuyet doi.
- [x] Vi du: ma cay co the duoc sinh tu DB theo dinh dang nhu `VNG-C001`.
- [x] Bang `NguoiDung` da co cot `TrangThai` va co the con phu thuoc vao logic luu tru san co.
- [x] KHONG duoc dung Node.js de can thiep de len trigger, stored logic, hoac quy tac nghiep vu dang dat tai CSDL.

## Coding Conventions

- [x] Controller bat buoc di qua `asyncHandler`.
- [x] Response thanh cong phai tra qua `baseResponse.js`.
- [x] Loi nghiep vu va loi validation phai duoc quan ly tap trung bang `AppError`.
- [x] Cam hard delete cho cac nghiep vu chinh neu du lieu da duoc su dung trong he thong.

## Known Decisions

- [x] Incident image upload hien tai dang o cap "su co tong the". Neu mot bao cao su co co nhieu `chiTietBaoCao`, toan bo anh upload multipart se duoc gan vao `MaChiTietBaoCao` dau tien.
- [x] Day la quyet dinh chu dong de toi uu UX va don gian hoa request cho mobile/web trong giai doan hien tai.
- [x] Neu tuong lai can map anh dung theo tung cay/chi tiet, phai doi contract frontend-backend: gui anh theo tung item `chiTietBaoCao` bang multipart co mapping theo index hoac JSON + Base64.

## Next Steps

- [x] Chuyen sang setup Frontend ReactJS va mapping day du voi backend hien tai.
- [x] Bo sung integration test cho module `files` va `catalogs` sau refactor.
- [x] Tich hop mail service vao cac use case thuc te nhu phe duyet ke hoach hoac cap nhat xu ly su co.
