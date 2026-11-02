import jwt from "jsonwebtoken";
import Operator from "../models/operatorModel.js";

const operatorAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Operator authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this token belongs to an operator
    if (decoded.role !== "operator" || !decoded.operatorId) {
      return res.status(403).json({
        success: false,
        message: "Operator access denied",
      });
    }

    const operator = await Operator.findById(decoded.operatorId)
      .select("-password");

    if (!operator) {
      return res.status(401).json({
        success: false,
        message: "Operator not found",
      });
    }

    // Adjust this check to match your schema's status field.
    if (operator.status && operator.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Operator account is inactive",
      });
    }

    req.operator = operator;
    req.operatorId = operator._id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired operator token",
      });
    }

    console.error("Operator authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default operatorAuthMiddleware;