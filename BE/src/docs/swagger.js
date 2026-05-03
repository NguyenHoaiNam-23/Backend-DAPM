const swaggerJsdoc = require("swagger-jsdoc");

const definition = {
  openapi: "3.0.3",
  info: {
    title: "Green Tree Management API",
    version: "1.0.0",
    description: "Interactive API docs for manual testing and frontend integration."
  },
  servers: [
    {
      url: "/api/v1",
      description: "Local API v1"
    }
  ],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Catalogs" },
    { name: "Trees" },
    { name: "Incidents" },
    { name: "Assignments" },
    { name: "Files" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Success" },
          data: { type: "object", nullable: true }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation error" },
          errors: {
            type: "array",
            items: {
              oneOf: [
                { type: "string" },
                {
                  type: "object",
                  additionalProperties: true
                }
              ]
            }
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "matKhau"],
        properties: {
          email: { type: "string", example: "nam@gmail.com" },
          matKhau: { type: "string", example: "hash123" }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["tenDangNhap", "hoTen", "email", "sdt", "matKhau", "maVaiTro", "maXaPhuong", "maTuyenDuong"],
        properties: {
          tenDangNhap: { type: "string", example: "namtest01" },
          hoTen: { type: "string", example: "Nguyen Van Nam" },
          email: { type: "string", example: "nam@gmail.com" },
          sdt: { type: "string", example: "0900000001" },
          matKhau: { type: "string", example: "123456" },
          maVaiTro: { type: "string", example: "CONGNAN" },
          maXaPhuong: { type: "string", example: "P01" },
          maTuyenDuong: { type: "string", example: "D01" },
          diaChi: { type: "string", example: "Da Nang" }
        }
      },
      UpdateProfileRequest: {
        type: "object",
        properties: {
          hoTen: { type: "string", example: "Nguyen Van Nam" },
          sdt: { type: "string", example: "0900000001" },
          diaChi: { type: "string", example: "Da Nang" }
        }
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["matKhauCu", "matKhauMoi"],
        properties: {
          matKhauCu: { type: "string", example: "hash123" },
          matKhauMoi: { type: "string", example: "hash123" }
        }
      },
      CreateTreeRequest: {
        type: "object",
        required: ["maDMCay", "maTuyenDuong", "maXaPhuong", "maNguoiCapNhat"],
        properties: {
          maDMCay: { type: "string", example: "LOAI01" },
          ngayTrong: { type: "string", format: "date", example: "2026-04-01" },
          nguonGoc: { type: "string", example: "Vuon uom" },
          chieuCaoHienTai: { type: "number", example: 3.5 },
          duongKinhThanHienTai: { type: "number", example: 0.08 },
          duongKinhTanHienTai: { type: "number", example: 1.2 },
          trangThaiSucKhoe: { type: "string", example: "Tot" },
          kinhDo: { type: "string", example: "108.2208" },
          viDo: { type: "string", example: "16.0471" },
          ghiChu: { type: "string", example: "Swagger create tree" },
          maTuyenDuong: { type: "string", example: "D01" },
          maXaPhuong: { type: "string", example: "P01" },
          maNguoiCapNhat: { type: "string", example: "U003" }
        }
      },
      UpdateTreeLocationRequest: {
        type: "object",
        properties: {
          kinhDo: { type: "string", example: "108.2211" },
          viDo: { type: "string", example: "16.0481" },
          lyDoCapNhat: { type: "string", example: "Update from Swagger" },
          maNguoiCapNhat: { type: "string", example: "U003" }
        }
      },
      RiskAssessmentRequest: {
        type: "object",
        required: ["mucDoNguyHiem", "maNguoiCapNhat"],
        properties: {
          mucDoNguyHiem: { type: "string", example: "Cao" },
          moTaDanhGia: { type: "string", example: "Can cat tia khan cap" },
          deXuatXuLy: { type: "string", example: "Cat tia" },
          maNguoiCapNhat: { type: "string", example: "U003" }
        }
      },
      UpdateIncidentStatusRequest: {
        type: "object",
        required: ["trangThaiXuLy"],
        properties: {
          trangThaiXuLy: { type: "string", example: "Dang xac minh" },
          ghiChu: { type: "string", example: "Cap nhat tu Swagger" },
          maNguoiXuLy: { type: "string", example: "U003" }
        }
      },
      RejectIncidentRequest: {
        type: "object",
        required: ["lyDoTuChoi"],
        properties: {
          lyDoTuChoi: { type: "string", example: "Thong tin chua hop le" },
          maNguoiXuLy: { type: "string", example: "U003" }
        }
      },
      AcceptTaskRequest: {
        type: "object",
        required: ["xacNhanNhanViec", "maCongNhan"],
        properties: {
          xacNhanNhanViec: { type: "boolean", example: true },
          maCongNhan: { type: "string", example: "U001" }
        }
      },
      ReviewTaskRequest: {
        type: "object",
        required: ["ketQuaNghiemThuChiTiet"],
        properties: {
          ketQuaNghiemThuChiTiet: { type: "string", example: "Dat" },
          yeuCauDanhGia: { type: "string", example: "Dat yeu cau" },
          lyDoYeuCauLamLai: { type: "string", example: "" },
          nguoiNghiemThu: { type: "string", example: "U003" }
        }
      },
      FinalReviewRequest: {
        type: "object",
        required: ["trangThaiNghiemThu"],
        properties: {
          trangThaiNghiemThu: { type: "string", example: "Da nghiem thu" },
          yKienNghiemThu: { type: "string", example: "Hoan thanh tot" },
          nguoiNghiemThu: { type: "string", example: "U003" }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: { description: "Logged in" },
          400: { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: { description: "Registered" },
          400: { description: "Validation error" }
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Profile data" },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get profile alias",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Profile data" } }
      },
      put: {
        tags: ["Auth"],
        summary: "Update profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Change password alias",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" }
            }
          }
        },
        responses: { 200: { description: "Password changed" } }
      }
    },
    "/catalogs/tree-types": {
      get: { tags: ["Catalogs"], summary: "List tree types", responses: { 200: { description: "OK" } } },
      post: { tags: ["Catalogs"], summary: "Create tree type", responses: { 201: { description: "Created" } } }
    },
    "/catalogs/work-types": {
      get: { tags: ["Catalogs"], summary: "List work types", responses: { 200: { description: "OK" } } },
      post: { tags: ["Catalogs"], summary: "Create work type", responses: { 201: { description: "Created" } } }
    },
    "/catalogs/wards": {
      get: { tags: ["Catalogs"], summary: "List wards", responses: { 200: { description: "OK" } } },
      post: { tags: ["Catalogs"], summary: "Create ward", responses: { 201: { description: "Created" } } }
    },
    "/catalogs/streets": {
      get: {
        tags: ["Catalogs"],
        summary: "List streets",
        parameters: [
          { in: "query", name: "maXaPhuong", schema: { type: "string" }, example: "P01" }
        ],
        responses: { 200: { description: "OK" } }
      },
      post: { tags: ["Catalogs"], summary: "Create street", responses: { 201: { description: "Created" } } }
    },
    "/trees": {
      get: { tags: ["Trees"], summary: "List trees", responses: { 200: { description: "OK" } } },
      post: {
        tags: ["Trees"],
        summary: "Create tree",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTreeRequest" }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/trees/map": {
      get: { tags: ["Trees"], summary: "List trees for map", responses: { 200: { description: "OK" } } }
    },
    "/trees/dangerous": {
      get: { tags: ["Trees"], summary: "List dangerous trees", responses: { 200: { description: "OK" } } }
    },
    "/trees/import": {
      post: {
        tags: ["Trees"],
        summary: "Import trees from Excel",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "maTuyenDuong", "maXaPhuong", "maNguoiCapNhat"],
                properties: {
                  file: { type: "string", format: "binary" },
                  maTuyenDuong: { type: "string", example: "D01" },
                  maXaPhuong: { type: "string", example: "P01" },
                  maNguoiCapNhat: { type: "string", example: "U003" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Imported" } }
      }
    },
    "/trees/{maCay}": {
      get: {
        tags: ["Trees"],
        summary: "Get tree detail",
        parameters: [{ in: "path", name: "maCay", required: true, schema: { type: "string" }, example: "LVH-C001" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" } }
      },
      put: {
        tags: ["Trees"],
        summary: "Update tree",
        parameters: [{ in: "path", name: "maCay", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTreeRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/trees/{maCay}/location": {
      put: {
        tags: ["Trees"],
        summary: "Update tree location",
        parameters: [{ in: "path", name: "maCay", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTreeLocationRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      },
      patch: {
        tags: ["Trees"],
        summary: "Patch tree location",
        parameters: [{ in: "path", name: "maCay", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTreeLocationRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/trees/{maCay}/risk-assessments": {
      post: {
        tags: ["Trees"],
        summary: "Create risk assessment",
        parameters: [{ in: "path", name: "maCay", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RiskAssessmentRequest" }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/incidents": {
      get: { tags: ["Incidents"], summary: "List incidents", responses: { 200: { description: "OK" } } },
      post: {
        tags: ["Incidents"],
        summary: "Create incident",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["maXaPhuong", "diaChiCuThe", "loaiPhanAnh", "chiTietBaoCao"],
                properties: {
                  maNguoiBaoCao: { type: "string", example: "U001" },
                  maXaPhuong: { type: "string", example: "P01" },
                  diaChiCuThe: { type: "string", example: "Tran Phu street" },
                  loaiPhanAnh: { type: "string", example: "Cay nghieng nguy hiem" },
                  noiDungPhanAnh: { type: "string", example: "Can xu ly gap" },
                  chiTietBaoCao: {
                    type: "string",
                    example: "[{\"maCay\":\"LVH-C001\",\"mucDoNguyHiem\":\"Cao\",\"moTaTinhTrang\":\"Canh gay\"}]"
                  },
                  hinhAnh: {
                    type: "array",
                    items: { type: "string", format: "binary" }
                  }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/incidents/my": {
      get: {
        tags: ["Incidents"],
        summary: "List my incidents",
        parameters: [{ in: "query", name: "maNguoiBaoCao", schema: { type: "string" }, example: "U001" }],
        responses: { 200: { description: "OK" } }
      }
    },
    "/incidents/{maBaoCao}": {
      get: {
        tags: ["Incidents"],
        summary: "Get incident detail",
        parameters: [{ in: "path", name: "maBaoCao", required: true, schema: { type: "string" }, example: "BC001" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" } }
      }
    },
    "/incidents/{maBaoCao}/status": {
      put: {
        tags: ["Incidents"],
        summary: "Update incident status",
        parameters: [{ in: "path", name: "maBaoCao", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateIncidentStatusRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/incidents/{maBaoCao}/reject": {
      put: {
        tags: ["Incidents"],
        summary: "Reject incident",
        parameters: [{ in: "path", name: "maBaoCao", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RejectIncidentRequest" }
            }
          }
        },
        responses: { 200: { description: "Rejected" } }
      }
    },
    "/incidents/{maBaoCao}/reply": {
      put: {
        tags: ["Incidents"],
        summary: "Reply incident result",
        parameters: [{ in: "path", name: "maBaoCao", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["traLoiPhanHoi"],
                properties: {
                  traLoiPhanHoi: { type: "string", example: "Da xu ly xong" },
                  maNguoiXuLy: { type: "string", example: "U003" },
                  pdfDinhKemXuLy: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/assignments": {
      get: { tags: ["Assignments"], summary: "List assignments", responses: { 200: { description: "OK" } } },
      post: {
        tags: ["Assignments"],
        summary: "Create assignment",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["maKHCV", "tieuDe", "danhSachCongNhan"],
                properties: {
                  maKHCV: { type: "string", example: "KH001" },
                  tieuDe: { type: "string", example: "Phan cong cat tia cay" },
                  nguoiTao: { type: "string", example: "U003" },
                  filePDF: { type: "string", format: "binary" },
                  danhSachCongNhan: {
                    type: "string",
                    example: "[{\"maCongNhan\":\"U001\",\"congViecCuThe\":\"Cat tia\",\"thoiGianBatDau\":\"2026-04-01T08:00:00\",\"thoiGianKetThuc\":\"2026-04-01T17:00:00\"}]"
                  }
                }
              }
            }
          }
        },
        responses: { 201: { description: "Created" } }
      }
    },
    "/assignments/my-tasks": {
      get: {
        tags: ["Assignments"],
        summary: "List my tasks",
        parameters: [{ in: "query", name: "maCongNhan", schema: { type: "string" }, example: "U001" }],
        responses: { 200: { description: "OK" } }
      }
    },
    "/assignments/rework-tasks": {
      get: {
        tags: ["Assignments"],
        summary: "List rework tasks",
        parameters: [{ in: "query", name: "maCongNhan", schema: { type: "string" }, example: "U001" }],
        responses: { 200: { description: "OK" } }
      }
    },
    "/assignments/{maKHPC}": {
      get: {
        tags: ["Assignments"],
        summary: "Get assignment detail",
        parameters: [{ in: "path", name: "maKHPC", required: true, schema: { type: "string" }, example: "PC001" }],
        responses: { 200: { description: "OK" }, 404: { description: "Not found" } }
      }
    },
    "/assignments/details/{maChiTiet}/accept": {
      put: {
        tags: ["Assignments"],
        summary: "Accept task",
        parameters: [{ in: "path", name: "maChiTiet", required: true, schema: { type: "string" }, example: "CTPC001" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AcceptTaskRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/assignments/details/{maChiTiet}/execute": {
      put: {
        tags: ["Assignments"],
        summary: "Execute task with before/after images",
        parameters: [{ in: "path", name: "maChiTiet", required: true, schema: { type: "string" }, example: "CTPC001" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["xacNhanHoanTat", "maCongNhan"],
                properties: {
                  xacNhanHoanTat: { type: "boolean", example: true },
                  khoiLuongHoanThanh: { type: "string", example: "Hoan thanh 100%" },
                  lyDo: { type: "string", example: "Complete" },
                  maCongNhan: { type: "string", example: "U001" },
                  anhTruoc: { type: "array", items: { type: "string", format: "binary" } },
                  anhSau: { type: "array", items: { type: "string", format: "binary" } }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/assignments/details/{maChiTiet}/review": {
      put: {
        tags: ["Assignments"],
        summary: "Review task detail",
        parameters: [{ in: "path", name: "maChiTiet", required: true, schema: { type: "string" }, example: "CTPC001" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReviewTaskRequest" }
            }
          }
        },
        responses: { 200: { description: "Reviewed" } }
      }
    },
    "/assignments/details/{maChiTiet}/rework": {
      put: {
        tags: ["Assignments"],
        summary: "Submit rework result",
        parameters: [{ in: "path", name: "maChiTiet", required: true, schema: { type: "string" }, example: "CTPC001" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["maCongNhan"],
                properties: {
                  khoiLuongHoanThanh: { type: "string", example: "Lam lai hoan tat" },
                  ghiChuLamLai: { type: "string", example: "Da sua theo yeu cau" },
                  maCongNhan: { type: "string", example: "U001" },
                  anhTruoc: { type: "array", items: { type: "string", format: "binary" } },
                  anhSau: { type: "array", items: { type: "string", format: "binary" } }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/assignments/{maKHPC}/final-review": {
      put: {
        tags: ["Assignments"],
        summary: "Final review assignment",
        parameters: [{ in: "path", name: "maKHPC", required: true, schema: { type: "string" }, example: "PC001" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FinalReviewRequest" }
            }
          }
        },
        responses: { 200: { description: "Updated" } }
      }
    },
    "/files/{filename}": {
      get: {
        tags: ["Files"],
        summary: "Serve uploaded file from upload root",
        parameters: [{ in: "path", name: "filename", required: true, schema: { type: "string" }, example: "example.pdf" }],
        responses: {
          200: { description: "File content" },
          404: { description: "File not found" }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJsdoc({
  definition,
  apis: []
});

module.exports = swaggerSpec;
