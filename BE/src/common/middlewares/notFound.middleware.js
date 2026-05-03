const notFoundMiddleware = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "Không tìm thấy API",
    errors: [
      {
        path: req.originalUrl,
        method: req.method
      }
    ]
  });
};

module.exports = notFoundMiddleware;