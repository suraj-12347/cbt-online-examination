import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Invigilator from "../models/invigilatorModel.js";
import ScheduledExam from "../models/scheduledExamModel.js";

// =====================================================
// Create Invigilator
// Admin will create invigilator account
// =====================================================

export const createInvigilator = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      phone,
    } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and employee ID are required",
      });
    }

    const existingEmail = await Invigilator.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Invigilator email already exists",
      });
    }

    const existingEmployeeId = await Invigilator.findOne({
      employeeId,
    });

    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const invigilator = await Invigilator.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      employeeId,
      phone: phone || "",
    });

    const responseData = invigilator.toObject();

    delete responseData.password;

    res.status(201).json({
      success: true,
      message: "Invigilator created successfully",
      invigilator: responseData,
    });
  } catch (error) {
    console.error("Create Invigilator Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create invigilator",
      error: error.message,
    });
  }
};

// =====================================================
// Login Invigilator
// =====================================================

export const loginInvigilator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const invigilator = await Invigilator.findOne({
      email: email.toLowerCase(),
    });

    if (!invigilator) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (invigilator.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Invigilator account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      invigilator.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        invigilatorId: invigilator._id,
        role: "invigilator",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      invigilator: {
        id: invigilator._id,
        name: invigilator.name,
        email: invigilator.email,
        employeeId: invigilator.employeeId,
        phone: invigilator.phone,
        image: invigilator.image,
        status: invigilator.status,
      },
    });
  } catch (error) {
    console.error("Invigilator Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// =====================================================
// Get All Invigilators
// =====================================================

export const getAllInvigilators = async (req, res) => {
  try {
    const invigilators = await Invigilator.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invigilators.length,
      invigilators,
    });
  } catch (error) {
    console.error("Get Invigilators Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invigilators",
      error: error.message,
    });
  }
};

// =====================================================
// Get Single Invigilator
// =====================================================

export const getInvigilatorById = async (req, res) => {
  try {
    const invigilator = await Invigilator.findById(
      req.params.id
    ).select("-password");

    if (!invigilator) {
      return res.status(404).json({
        success: false,
        message: "Invigilator not found",
      });
    }

    res.json({
      success: true,
      invigilator,
    });
  } catch (error) {
    console.error("Get Invigilator Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invigilator",
      error: error.message,
    });
  }
};

// =====================================================
// Update Invigilator
// =====================================================

export const updateInvigilator = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      phone,
      status,
    } = req.body;

    const invigilator = await Invigilator.findById(
      req.params.id
    );

    if (!invigilator) {
      return res.status(404).json({
        success: false,
        message: "Invigilator not found",
      });
    }

    if (name !== undefined) {
      invigilator.name = name;
    }

    if (email !== undefined) {
      invigilator.email = email.toLowerCase();
    }

    if (employeeId !== undefined) {
      invigilator.employeeId = employeeId;
    }

    if (phone !== undefined) {
      invigilator.phone = phone;
    }

    if (status !== undefined) {
      invigilator.status = status;
    }

    if (password) {
      invigilator.password = await bcrypt.hash(
        password,
        10
      );
    }

    await invigilator.save();

    const responseData = invigilator.toObject();

    delete responseData.password;

    res.json({
      success: true,
      message: "Invigilator updated successfully",
      invigilator: responseData,
    });
  } catch (error) {
    console.error("Update Invigilator Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update invigilator",
      error: error.message,
    });
  }
};

// =====================================================
// Delete Invigilator
// =====================================================

export const deleteInvigilator = async (req, res) => {
  try {
    const invigilator = await Invigilator.findById(
      req.params.id
    );

    if (!invigilator) {
      return res.status(404).json({
        success: false,
        message: "Invigilator not found",
      });
    }

    const assignedExam = await ScheduledExam.findOne({
      invigilatorId: invigilator._id,
      status: {
        $in: ["scheduled", "active"],
      },
    });

    if (assignedExam) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete invigilator with active or scheduled exams",
      });
    }

    await Invigilator.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Invigilator deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invigilator Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete invigilator",
      error: error.message,
    });
  }
};

// =====================================================
// Get Exams Assigned To Invigilator
// =====================================================

export const getAssignedExams = async (req, res) => {
  try {
    const invigilatorId = req.invigilatorId;

    if (!invigilatorId) {
      return res.status(401).json({
        success: false,
        message: "Invigilator authentication required",
      });
    }

    const exams = await ScheduledExam.find({ invigilatorId })
      .populate("examId", "title description duration")
      .populate(
        "studentId",
        "name email rollNo rollNumber course branch semester"
      )
      .sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("Get assigned exams error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned exams",
    });
  }
};