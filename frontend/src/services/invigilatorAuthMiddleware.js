// middleware/invigilatorAuthMiddleware.js

import jwt from "jsonwebtoken";

// =====================================================
// Invigilator Authentication Middleware
// =====================================================

export const invigilatorAuthMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    // Expected format:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check invigilator role
    if (decoded.role !== "invigilator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invigilator access required",
      });
    }

    // Check invigilator ID
    if (!decoded.invigilatorId) {
      return res.status(401).json({
        success: false,
        message: "Invalid invigilator token",
      });
    }

    // Store authenticated user information
    req.user = {
      invigilatorId: decoded.invigilatorId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error(
      "Invigilator Auth Middleware Error:",
      error
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invigilator token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid invigilator token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};