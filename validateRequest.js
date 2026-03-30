const { ZodError } = require("zod");

module.exports = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const error = new Error("Validation error");
      error.statusCode = 400;
      error.details = err.errors.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(error);
    }
    next(err);
  }
};
