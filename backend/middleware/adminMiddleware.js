
const adminMiddleware = (req, res, next) => {
  const admin = req.user;

  if (!admin) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (admin.role?.toLowerCase() !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  req.admin = admin;
  next();
};

export default adminMiddleware;
