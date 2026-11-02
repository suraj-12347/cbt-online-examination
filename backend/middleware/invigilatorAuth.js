import jwt from "jsonwebtoken";
import Invigilator from "../models/invigilatorModel.js";

const invigilatorAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "invigilator" || !decoded.invigilatorId) {
      return res.status(403).json({
        success: false,
        message: "Invalid invigilator token",
      });
    }

    const invigilator = await Invigilator.findById(
      decoded.invigilatorId
    ).select("-password");

    if (!invigilator) {
      return res.status(401).json({
        success: false,
        message: "Invigilator account not found",
      });
    }

    if (invigilator.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your invigilator account is inactive",
      });
    }

    req.invigilator = invigilator;
    req.invigilatorId = invigilator._id.toString();

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token",
      });
    }

    console.error("Invigilator Auth Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default invigilatorAuth;