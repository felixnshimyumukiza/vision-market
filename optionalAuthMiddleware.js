const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/security");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    req.user = jwt.verify(token, getJwtSecret());
  } catch (err) {
    req.user = null;
  }

  next();
};
