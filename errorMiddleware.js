module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message =
    status >= 500 ? "Internal server error" : err.message || "Server error";
  const errorId =
    status >= 500
      ? `VM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase()}`
      : undefined;

  if (status >= 500) {
    console.error(`[${errorId}]`, err);
  }

  const response = { message };
  if (errorId) {
    response.errorId = errorId;
  }
  if (err.details) {
    response.details = err.details;
  }

  res.status(status).json(response);
};
