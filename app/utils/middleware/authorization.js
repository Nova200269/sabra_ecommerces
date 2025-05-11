export const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();

  return next(new Error("Access denied", 403));
};
