const successResponse = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const createdResponse = (res, data = null, message = "Tạo mới thành công") => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = "Có lỗi xảy ra", statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse
};