USE master;
GO

-- ==========================================
-- 1. KIỂM TRA VÀ TẠO DATABASE
-- ==========================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'QuanLyCayXanhDN')
BEGIN
    ALTER DATABASE QuanLyCayXanhDN SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE QuanLyCayXanhDN;
END
GO

CREATE DATABASE QuanLyCayXanhDN;
GO

USE QuanLyCayXanhDN;
GO

-- ==========================================
-- 2. NHÓM DANH MỤC & PHÂN QUYỀN
-- ==========================================

CREATE TABLE QuyenHan (
    MaQuyen VARCHAR(20) PRIMARY KEY,
    TenQuyenHan NVARCHAR(100),
    MoTa NVARCHAR(500),
    Slug VARCHAR(100),
    TenDanhMucCha NVARCHAR(100),
    Icon VARCHAR(MAX)
);
GO

CREATE TABLE VaiTro (
    MaVaiTro VARCHAR(10) PRIMARY KEY,
    TenVaiTro NVARCHAR(100),
    MoTa NVARCHAR(500),
    Slug VARCHAR(100),
    Icon VARCHAR(MAX)
);
GO

CREATE TABLE GanQuyen (
    MaVaiTro VARCHAR(10),
    MaQuyen VARCHAR(20),
    PRIMARY KEY (MaVaiTro, MaQuyen),
    CONSTRAINT FK_GanQuyen_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro),
    CONSTRAINT FK_GanQuyen_QuyenHan FOREIGN KEY (MaQuyen) REFERENCES QuyenHan(MaQuyen)
);
GO

CREATE TABLE XaPhuong (
    MaXaPhuong VARCHAR(20) PRIMARY KEY,
    MaHanhChinh INT,
    TenXaPhuong NVARCHAR(150),
    LoaiDanhMuc NVARCHAR(10)
);
GO

CREATE TABLE TuyenDuong (
    MaTuyenDuong VARCHAR(20) PRIMARY KEY,
    TenTuyenDuong NVARCHAR(150),
    TenVietTat VARCHAR(10), -- Phục vụ sinh mã cây tự động
    LoaiDuong NVARCHAR(50),
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong)
);
GO

CREATE TABLE NguoiDung (
    MaNguoiDung VARCHAR(20) PRIMARY KEY,
    TenDangNhap VARCHAR(17) UNIQUE,
    MatKhauHash VARCHAR(MAX),
    HoTen NVARCHAR(50),
    Email VARCHAR(254),
    SDT CHAR(10),
    TrangThai NVARCHAR(50) NULL,
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong),
    MaTuyenDuong VARCHAR(20) FOREIGN KEY REFERENCES TuyenDuong(MaTuyenDuong),
    DiaChi NVARCHAR(100),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME,
    MaVaiTro VARCHAR(10) FOREIGN KEY REFERENCES VaiTro(MaVaiTro),
    CONSTRAINT CHK_NguoiDung_Email CHECK (Email LIKE '%@%._%'),
    CONSTRAINT CHK_NguoiDung_SDT CHECK (ISNUMERIC(SDT) = 1 AND LEN(SDT) >= 10)
);
GO

-- ==========================================
-- 3. NHÓM QUẢN LÝ CÂY XANH
-- ==========================================

CREATE TABLE DanhMucCayTrong (
    MaDMCay VARCHAR(20) PRIMARY KEY,
    TenCayTrong NVARCHAR(100),
    ChieuCaoTruongThanh DECIMAL(18,2),
    DuongKinhTruongThanh DECIMAL(18,2),
    HinhThucTanCay NVARCHAR(20),
    DangLa NVARCHAR(20),
    MauLa NVARCHAR(50),
    KyRungLa NVARCHAR(20),
    KyNoHoa NVARCHAR(20),
    MauHoa NVARCHAR(50),
    LoaiCay NVARCHAR(50),
    MoTa NVARCHAR(500),
    TrangThai NVARCHAR(50),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME
);
GO

CREATE TABLE CayXanh (
    MaCay VARCHAR(20) PRIMARY KEY,
    MaDMCay VARCHAR(20) FOREIGN KEY REFERENCES DanhMucCayTrong(MaDMCay),
    NgayTrong DATETIME,
    NguonGoc NVARCHAR(500),
    ChieuCaoHienTai DECIMAL(18,2),
    DuongKinhThanHienTai DECIMAL(18,2),
    DuongKinhTanHienTai DECIMAL(18,2),
    TrangThaiSucKhoe NVARCHAR(50),
    KinhDo VARCHAR(100),
    ViDo VARCHAR(100),
    GhiChu NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME,
    MaTuyenDuong VARCHAR(20) FOREIGN KEY REFERENCES TuyenDuong(MaTuyenDuong),
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong),
    MaNguoiCapNhat VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    CONSTRAINT CHK_CayXanh_KichThuoc CHECK (ChieuCaoHienTai >= 0 AND DuongKinhThanHienTai >= 0)
);
GO

CREATE TABLE DanhMucCongViec (
    MaLoaiCongViec VARCHAR(20) PRIMARY KEY,
    TenCongViec NVARCHAR(150),
    MoTaCV NVARCHAR(500)
);
GO

-- ==========================================
-- 4. NHÓM KẾ HOẠCH & PHÂN CÔNG
-- ==========================================

CREATE TABLE KeHoachCongViec (
    MaKeHoach VARCHAR(20) PRIMARY KEY,
    MaLoaiCongViec VARCHAR(20) FOREIGN KEY REFERENCES DanhMucCongViec(MaLoaiCongViec),
    TieuDe NVARCHAR(200),
    MoTa NVARCHAR(500),
    FilePDFKeHoach VARCHAR(MAX),
    FilePDFDeNghiCapPhep VARCHAR(MAX),
    NguoiLap VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TrangThai NVARCHAR(50),
    FilePDFBoSungKeHoach VARCHAR(MAX),
    YKienPheDuyet NVARCHAR(200),
    NguoiPheDuyet VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayPheDuyet DATETIME,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME,
    NguoiXuLy VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayXuLy DATETIME,
    MaTuyenDuong VARCHAR(20) FOREIGN KEY REFERENCES TuyenDuong(MaTuyenDuong),
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong)
);
GO

CREATE TABLE KeHoachPhanCong (
    MaKHPC VARCHAR(20) PRIMARY KEY,
    MaKHCV VARCHAR(20) FOREIGN KEY REFERENCES KeHoachCongViec(MaKeHoach),
    TieuDe NVARCHAR(150),
    FilePDF VARCHAR(MAX),
    NguoiTao VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiCapNhat VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayCapNhat DATETIME,
    TrangThaiNghiemThu NVARCHAR(100),
    NgayNghiemThu DATETIME,
    NguoiNghiemThu VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    YKienNghiemThu NVARCHAR(500)
);
GO

CREATE TABLE ChiTietPhanCong (
    MaChiTiet VARCHAR(20) PRIMARY KEY,
    MaKHPC VARCHAR(20) FOREIGN KEY REFERENCES KeHoachPhanCong(MaKHPC),
    MaCongNhan VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    CongViecCuThe NVARCHAR(500),
    ThoiGianBatDau DATETIME,
    ThoiGianKetThuc DATETIME,
    XacNhanLam BIT DEFAULT 0,
    LyDo NVARCHAR(500),
    AnhTruocPhanCong VARCHAR(20),
    AnhSauPhanCong VARCHAR(20),
    KhoiLuongHoanThanh NVARCHAR(100),
    XacNhanHoanTat BIT DEFAULT 0,
    NgayCapNhat DATETIME,
    DanhGia NVARCHAR(500),
    YeuCauLamLai BIT DEFAULT 0,
    LyDoYeuCauLamLai NVARCHAR(500),
    KetQuaNghiemThuChiTiet NVARCHAR(500),
    NguoiDanhGia VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayDanhGia DATETIME,
    CONSTRAINT CHK_ThoiGianLamViec CHECK (ThoiGianKetThuc >= ThoiGianBatDau)
);
GO

CREATE TABLE AnhTruocPhanCong (
    MaAnhTruoc VARCHAR(20) PRIMARY KEY,
    MaChiTietPhanCong VARCHAR(20) FOREIGN KEY REFERENCES ChiTietPhanCong(MaChiTiet),
    DuongDanAnh VARCHAR(MAX),
    MoTa NVARCHAR(150),
    NgayUpload DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE AnhSauPhanCong (
    MaAnhSau VARCHAR(20) PRIMARY KEY,
    MaChiTietPhanCong VARCHAR(20) FOREIGN KEY REFERENCES ChiTietPhanCong(MaChiTiet),
    DuongDanAnh VARCHAR(MAX),
    MoTa NVARCHAR(150),
    NgayUpload DATETIME DEFAULT GETDATE()
);
GO

-- ==========================================
-- 5. NHÓM BÁO CÁO & LƯU TRỮ
-- ==========================================

CREATE TABLE BaoCaoSuCo (
    MaBaoCao VARCHAR(20) PRIMARY KEY,
    MaNguoiBaoCao VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    ThoiGianBaoCao DATETIME,
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong),
    DiaChiCuThe NVARCHAR(100),
    LoaiPhanAnh NVARCHAR(500),
    TrangThaiXuLy NVARCHAR(50),
    MaNguoiXuLy VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TraLoiPhanHoi NVARCHAR(500),
    PDFDinhKemXuLy VARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME
);
GO

CREATE TABLE ChiTietBaoCao (
    MaChiTietBaoCao VARCHAR(20) PRIMARY KEY,
    MaBaoCao VARCHAR(20) FOREIGN KEY REFERENCES BaoCaoSuCo(MaBaoCao),
    MaCay VARCHAR(20) FOREIGN KEY REFERENCES CayXanh(MaCay),
    MaTuyenDuong VARCHAR(20) FOREIGN KEY REFERENCES TuyenDuong(MaTuyenDuong),
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong),
    MoTaTìnhTrang NVARCHAR(500),
    MucDoNguyHiem NVARCHAR(50),
    DaXuLy BIT DEFAULT 0,
    CONSTRAINT CHK_MucDoNguyHiem CHECK (MucDoNguyHiem IN (N'Thấp', N'Trung bình', N'Cao', N'Khẩn cấp'))
);
GO

CREATE TABLE HinhAnhBaoCao (
    MaHinhAnh VARCHAR(20) PRIMARY KEY,
    MaChiTietBaoCao VARCHAR(20) FOREIGN KEY REFERENCES ChiTietBaoCao(MaChiTietBaoCao),
    DuongDanHinh VARCHAR(MAX),
    MoTaHinh NVARCHAR(100),
    NgayUpload DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE HoSoLuuTruNghiemThu (
    MaHoSo VARCHAR(20) PRIMARY KEY,
    MaLoaiCongViec VARCHAR(20) FOREIGN KEY REFERENCES DanhMucCongViec(MaLoaiCongViec),
    TieuDe NVARCHAR(150),
    MoTa NVARCHAR(500),
    FilePDF VARCHAR(MAX),
    NguoiTao VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayTao DATETIME DEFAULT GETDATE(),
    NguoiCapNhat VARCHAR(20) FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NgayCapNhat DATETIME,
    MaXaPhuong VARCHAR(20) FOREIGN KEY REFERENCES XaPhuong(MaXaPhuong),
    MaTuyenDuong VARCHAR(20) FOREIGN KEY REFERENCES TuyenDuong(MaTuyenDuong)
);
GO

-- ==========================================
-- 6. HỆ THỐNG TRIGGERS (TỰ ĐỘNG HÓA)
-- ==========================================

-- Trigger 1: Tự động tạo Tên viết tắt cho Tuyến đường
GO
CREATE OR ALTER TRIGGER trg_AutoGenerateTenVietTat
ON TuyenDuong
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TenTuyenDuong NVARCHAR(150), @TenVietTat VARCHAR(10), @MaTuyenDuong VARCHAR(20), @MaXaPhuong VARCHAR(20), @LoaiDuong NVARCHAR(50);
    
    DECLARE cursor_TD CURSOR FOR SELECT MaTuyenDuong, TenTuyenDuong, LoaiDuong, MaXaPhuong FROM inserted;
    OPEN cursor_TD;
    FETCH NEXT FROM cursor_TD INTO @MaTuyenDuong, @TenTuyenDuong, @LoaiDuong, @MaXaPhuong;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @TenVietTat = '';
        DECLARE @TempName NVARCHAR(155) = ' ' + LTRIM(RTRIM(@TenTuyenDuong));
        DECLARE @Pos INT = 1;

        WHILE @Pos < LEN(@TempName)
        BEGIN
            IF SUBSTRING(@TempName, @Pos, 1) = ' '
            BEGIN
                SET @TenVietTat = @TenVietTat + UPPER(SUBSTRING(@TempName, @Pos + 1, 1));
            END
            SET @Pos = @Pos + 1;
        END

        INSERT INTO TuyenDuong (MaTuyenDuong, TenTuyenDuong, LoaiDuong, MaXaPhuong, TenVietTat)
        VALUES (@MaTuyenDuong, @TenTuyenDuong, @LoaiDuong, @MaXaPhuong, @TenVietTat);

        FETCH NEXT FROM cursor_TD INTO @MaTuyenDuong, @TenTuyenDuong, @LoaiDuong, @MaXaPhuong;
    END
    CLOSE cursor_TD;
    DEALLOCATE cursor_TD;
END;
GO

-- Trigger 2: Tự động sinh Mã Cây theo định dạng TTD-Cxxx (Đã fix lỗi chèn nhiều dòng)
GO
CREATE OR ALTER TRIGGER trg_GenerateMaCay
ON CayXanh
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaDMCay VARCHAR(20), @NgayTrong DATETIME, @NguonGoc NVARCHAR(500), 
            @ChieuCaoHienTai DECIMAL(18,2), @DuongKinhThanHienTai DECIMAL(18,2), 
            @DuongKinhTanHienTai DECIMAL(18,2), @TrangThaiSucKhoe NVARCHAR(50), 
            @KinhDo VARCHAR(100), @ViDo VARCHAR(100), @GhiChu NVARCHAR(MAX), 
            @MaTuyenDuong VARCHAR(20), @MaXaPhuong VARCHAR(20), @MaNguoiCapNhat VARCHAR(20), 
            @NgayTao DATETIME, @NgayCapNhat DATETIME;

    DECLARE @Prefix VARCHAR(10), @NextNumber INT, @NewMaCay VARCHAR(20);

    DECLARE cur_CayXanh CURSOR FOR 
    SELECT MaDMCay, NgayTrong, NguonGoc, ChieuCaoHienTai, DuongKinhThanHienTai, 
           DuongKinhTanHienTai, TrangThaiSucKhoe, KinhDo, ViDo, GhiChu, 
           ISNULL(NgayTao, GETDATE()), NgayCapNhat, MaTuyenDuong, MaXaPhuong, MaNguoiCapNhat
    FROM inserted;

    OPEN cur_CayXanh;
    FETCH NEXT FROM cur_CayXanh INTO @MaDMCay, @NgayTrong, @NguonGoc, @ChieuCaoHienTai, @DuongKinhThanHienTai, 
                                     @DuongKinhTanHienTai, @TrangThaiSucKhoe, @KinhDo, @ViDo, @GhiChu, 
                                     @NgayTao, @NgayCapNhat, @MaTuyenDuong, @MaXaPhuong, @MaNguoiCapNhat;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @Prefix = TenVietTat FROM TuyenDuong WHERE MaTuyenDuong = @MaTuyenDuong;
        IF @Prefix IS NULL SET @Prefix = LEFT(@MaTuyenDuong, 3);

        SELECT @NextNumber = ISNULL(MAX(CAST(RIGHT(MaCay, 3) AS INT)), 0) + 1
        FROM CayXanh
        WHERE MaCay LIKE @Prefix + '-C%';

        SET @NewMaCay = @Prefix + '-C' + RIGHT('000' + CAST(@NextNumber AS VARCHAR), 3);

        INSERT INTO CayXanh (
            MaCay, MaDMCay, NgayTrong, NguonGoc, ChieuCaoHienTai, 
            DuongKinhThanHienTai, DuongKinhTanHienTai, TrangThaiSucKhoe, 
            KinhDo, ViDo, GhiChu, NgayTao, NgayCapNhat, MaTuyenDuong, MaXaPhuong, MaNguoiCapNhat
        ) VALUES (
            @NewMaCay, @MaDMCay, @NgayTrong, @NguonGoc, @ChieuCaoHienTai, 
            @DuongKinhThanHienTai, @DuongKinhTanHienTai, @TrangThaiSucKhoe, 
            @KinhDo, @ViDo, @GhiChu, @NgayTao, @NgayCapNhat, @MaTuyenDuong, @MaXaPhuong, @MaNguoiCapNhat
        );

        FETCH NEXT FROM cur_CayXanh INTO @MaDMCay, @NgayTrong, @NguonGoc, @ChieuCaoHienTai, @DuongKinhThanHienTai, 
                                         @DuongKinhTanHienTai, @TrangThaiSucKhoe, @KinhDo, @ViDo, @GhiChu, 
                                         @NgayTao, @NgayCapNhat, @MaTuyenDuong, @MaXaPhuong, @MaNguoiCapNhat;
    END

    CLOSE cur_CayXanh;
    DEALLOCATE cur_CayXanh;
END;
GO

-- Trigger 3: Cập nhật trạng thái cây khi nghiệm thu hoàn tất
GO
CREATE OR ALTER TRIGGER trg_UpdateTreeStatusOnTaskComplete
ON ChiTietPhanCong
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(XacNhanHoanTat)
    BEGIN
        UPDATE CX
        SET CX.TrangThaiSucKhoe = N'Tốt', CX.NgayCapNhat = GETDATE()
        FROM CayXanh CX
        INNER JOIN ChiTietBaoCao CTBC ON CX.MaCay = CTBC.MaCay
        INNER JOIN BaoCaoSuCo BCSC ON CTBC.MaBaoCao = BCSC.MaBaoCao
        INNER JOIN KeHoachPhanCong KHPC ON KHPC.MaKHPC = KHPC.MaKHPC
        INNER JOIN inserted i ON i.MaKHPC = KHPC.MaKHPC
        WHERE i.XacNhanHoanTat = 1;
    END
END;
GO

-- Trigger 4: Tự động đổi trạng thái Báo cáo sang "Đang xử lý"
GO
CREATE OR ALTER TRIGGER trg_AutoUpdateReportStatus
ON ChiTietBaoCao
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BCSC
    SET BCSC.TrangThaiXuLy = N'Đang xử lý', BCSC.NgayCapNhat = GETDATE()
    FROM BaoCaoSuCo BCSC
    INNER JOIN inserted i ON BCSC.MaBaoCao = i.MaBaoCao;
END;
GO

-- ==========================================
-- 7. DỮ LIỆU MẪU (TEST DATA)
-- ==========================================

INSERT INTO VaiTro (MaVaiTro, TenVaiTro) VALUES 
('ADMIN', N'Quản trị hệ thống'), ('CANBO', N'Cán bộ quản lý'), 
('NVKT', N'Nhân viên kỹ thuật'), ('CONGNAN', N'Công nhân');
GO

INSERT INTO XaPhuong (MaXaPhuong, TenXaPhuong) VALUES 
('P01', N'Phường Hòa Hải'), ('P02', N'Phường Hòa Quý'), ('P03', N'Phường Mỹ An');
GO

-- Trigger 1 sẽ tự động sinh cột TenVietTat thành: VNG, LVH, OIK
INSERT INTO TuyenDuong (MaTuyenDuong, TenTuyenDuong, MaXaPhuong) VALUES 
('D01', N'Võ Nguyên Giáp', 'P01'), 
('D02', N'Lê Văn Hiến', 'P01'), 
('D03', N'Ông Ích Khiêm', 'P01');
GO

INSERT INTO NguoiDung (MaNguoiDung, TenDangNhap, MatKhauHash, HoTen, SDT, Email, MaVaiTro, MaTuyenDuong, MaXaPhuong) VALUES 
('U001', 'admin_nam', 'hash123', N'Nguyễn Hoài Nam', '0905123456', 'nam@gmail.com', 'ADMIN', 'D01', 'P01'),
('U002', 'cb_ha', 'hash123', N'Trần Văn Hà', '0905654321', 'ha@gmail.com', 'CANBO', 'D01', 'P01'),
('U003', 'nv_minh', 'hash123', N'Lê Quang Minh', '0905111222', 'minh@gmail.com', 'NVKT', 'D02', 'P01'),
('U004', 'cn_hung', 'hash123', N'Phạm Tuấn Hùng', '0905333444', 'hung@gmail.com', 'CONGNAN', 'D02', 'P01');
GO

INSERT INTO DanhMucCayTrong (MaDMCay, TenCayTrong, LoaiCay) VALUES 
('LOAI01', N'Cây Bàng Đài Loan', N'Cây bóng mát'),
('LOAI02', N'Cây Giáng Hương', N'Cây đô thị');
GO

-- Điền DUMMY_ID vì Trigger 2 sẽ tự động chặn lại và sinh Mã Cây chuẩn: VNG-C001, LVH-C001, OIK-C001
INSERT INTO CayXanh (MaCay, MaDMCay, MaTuyenDuong, MaXaPhuong, TrangThaiSucKhoe, ChieuCaoHienTai, DuongKinhThanHienTai) VALUES 
('DUMMY1', 'LOAI01', 'D01', 'P01', N'Tốt', 5.0, 0.3),
('DUMMY2', 'LOAI02', 'D02', 'P01', N'Yếu', 3.5, 0.2),
('DUMMY3', 'LOAI01', 'D03', 'P01', N'Bình thường', 4.0, 0.25);
GO

INSERT INTO DanhMucCongViec (MaLoaiCongViec, TenCongViec) VALUES ('CV01', N'Cắt tỉa');
GO

INSERT INTO KeHoachCongViec (MaKeHoach, MaLoaiCongViec, TieuDe, NguoiLap, TrangThai, MaTuyenDuong, MaXaPhuong) VALUES 
('KH001', 'CV01', N'Kế hoạch cắt tỉa mùa mưa', 'U003', N'Đã phê duyệt', 'D01', 'P01');
GO

INSERT INTO KeHoachPhanCong (MaKHPC, MaKHCV, TieuDe, NguoiTao) VALUES ('PC001', 'KH001', N'Phân công đội 1', 'U003');
GO

INSERT INTO BaoCaoSuCo (MaBaoCao, MaNguoiBaoCao, MaXaPhuong, LoaiPhanAnh, TrangThaiXuLy) VALUES 
('BC001', 'U004', 'P01', N'Cây nghiêng', N'Chờ xử lý');
GO

-- Gắn sự cố cho cây đường Lê Văn Hiến (Mã sinh ra từ Trigger trước đó là LVH-C001)
INSERT INTO ChiTietBaoCao (MaChiTietBaoCao, MaBaoCao, MaCay, MaTuyenDuong, MaXaPhuong, MucDoNguyHiem) VALUES 
('CTBC001', 'BC001', 'LVH-C001', 'D02', 'P01', N'Cao');
GO