import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// =====================================================
// START: Register User
// =====================================================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNo,
      course,
      branch,
      semester,
      blacklisted,
      formStatus,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Check duplicate roll number
    if (rollNo) {
      const existingRollNo = await User.findOne({ rollNo });

      if (existingRollNo) {
        return res.status(400).json({
          message: "Roll number already exists",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Image path from Multer
    const image = req.file
      ? `/uploads/users/${req.file.filename}`
      : null;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image,
      rollNo: rollNo || "",

      // Student details
      course: course || "",
      branch: branch || "",
      semester: semester || "",

      // Student status
      blacklisted: blacklisted === true || blacklisted === "true",
      formStatus: formStatus === true || formStatus === "true",
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        rollNo: user.rollNo,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        blacklisted: user.blacklisted,
        formStatus: user.formStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};
// END: Register User


// =====================================================
// START: Login User
// =====================================================
export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        rollNo: user.rollNo,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        blacklisted: user.blacklisted,
        formStatus: user.formStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
// END: Login User


// =====================================================
// START: Get User Profile
// =====================================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
};
// END: Get User Profile


// =====================================================
// START: Get All Users
// =====================================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
};
// =====================================================
// Get User By ID
// =====================================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);

    res.status(500).json({
      message: "Failed to get student",
      error: error.message,
    });
  }
};

// =====================================================
// START: Update User
// =====================================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      rollNo,
      course,
      branch,
      semester,
      blacklisted,
      formStatus,
    } = req.body;

    // Find student
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // =================================================
    // Check duplicate email
    // =================================================
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    // =================================================
    // Check duplicate roll number
    // =================================================
    if (rollNo && rollNo !== user.rollNo) {
      const existingRollNo = await User.findOne({
        rollNo,
        _id: { $ne: id },
      });

      if (existingRollNo) {
        return res.status(400).json({
          message: "Roll number already exists",
        });
      }
    }

    // =================================================
    // Update Basic Details
    // =================================================
    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (rollNo !== undefined) {
      user.rollNo = rollNo;
    }

    if (course !== undefined) {
      user.course = course;
    }

    if (branch !== undefined) {
      user.branch = branch;
    }

    if (semester !== undefined) {
      user.semester = semester;
    }

    // =================================================
    // Update Status
    // =================================================
    if (blacklisted !== undefined) {
      user.blacklisted =
        blacklisted === true || blacklisted === "true";
    }

    if (formStatus !== undefined) {
      user.formStatus =
        formStatus === true || formStatus === "true";
    }

    // =================================================
    // Update Password
    // Only if new password is provided
    // =================================================
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    // =================================================
    // Update Image
    // =================================================
    if (req.file) {
      user.image = `/uploads/users/${req.file.filename}`;
    }

    // Save
    await user.save();

    // =================================================
    // Response
    // =================================================
    res.status(200).json({
      message: "Student updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        rollNo: user.rollNo,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        blacklisted: user.blacklisted,
        formStatus: user.formStatus,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// =====================================================
// START: Delete User
// =====================================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Find and delete student
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      deletedUserId: user._id,
    });

  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: error.message,
    });
  }
};
// =====================================================
// END: Delete User
// =====================================================
