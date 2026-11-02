
import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =====================================================
// Admin / Operator Login
// =====================================================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------------------------------------------------
    // Required Fields
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // -------------------------------------------------
    // Find Admin / Operator
    // -------------------------------------------------

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // Account Status
    // -------------------------------------------------

    if (admin.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    // -------------------------------------------------
    // Password Check
    // -------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // JWT Token
    // -------------------------------------------------

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.json({
      message: "Login successful",

      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        image: admin.image,
        role: admin.role,
        status: admin.status,
      },
    });

  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


// =====================================================
// Admin / Operator Profile
// =====================================================

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(
      req.admin.adminId
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json({
      admin,
    });

  } catch (error) {
    console.error(
      "GET ADMIN PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
};


