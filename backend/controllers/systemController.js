
import mongoose from "mongoose";
import System from "../models/systemModel.js";
import ScheduledExam from "../models/scheduledExamModel.js";

// =====================================================
// Helper Functions
// =====================================================

const sendServerError = (res, message, error) => {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
  });
};

const isValidObjectId = (value) =>
  typeof value === "string" &&
  mongoose.Types.ObjectId.isValid(value);

// =====================================================
// Admin + Operator Authorization
// =====================================================

const requireAdminOrOperator = (req, res) => {
  const role = req.user?.role?.toLowerCase();

  if (!["admin", "operator"].includes(role)) {
    res.status(403).json({
      success: false,
      message: "Admin or operator access is required",
    });

    return false;
  }

  return true;
};

// =====================================================
// Invigilator Authorization
// =====================================================

const requireInvigilator = (req, res) => {
  if (!req.invigilator || !req.invigilatorId) {
    res.status(403).json({
      success: false,
      message: "Invigilator access is required",
    });

    return false;
  }

  return true;
};

// =====================================================
// Verify Invigilator Assignment
// =====================================================

const INVIGILATOR_ASSIGNMENT_FIELDS = [
  "invigilatorId",
  "assignedInvigilator",
  "invigilator",
];

const INVIGILATOR_ASSIGNMENT_ARRAY_FIELDS = [
  "invigilators",
  "assignedInvigilators",
];

const idAsString = (value) => {
  if (value == null) return null;

  const id =
    typeof value === "object" && value._id
      ? value._id
      : value;

  return id == null ? null : String(id);
};

const isExamAssignedToInvigilator = (
  scheduledExam,
  invigilatorId
) => {
  if (!scheduledExam || !invigilatorId) {
    return false;
  }

  const currentId = String(invigilatorId);

  for (const field of INVIGILATOR_ASSIGNMENT_FIELDS) {
    if (scheduledExam[field] != null) {
      if (
        idAsString(scheduledExam[field]) === currentId
      ) {
        return true;
      }
    }
  }

  for (const field of INVIGILATOR_ASSIGNMENT_ARRAY_FIELDS) {
    if (Array.isArray(scheduledExam[field])) {
      if (
        scheduledExam[field].some(
          (entry) => idAsString(entry) === currentId
        )
      ) {
        return true;
      }
    }
  }

  // Default deny if assignment cannot be verified.
  return false;
};

const canInvigilatorAccessExam = (
  scheduledExam,
  req,
  res
) => {
  const allowed = isExamAssignedToInvigilator(
    scheduledExam,
    req.invigilatorId
  );

  if (!allowed) {
    res.status(403).json({
      success: false,
      message:
        "You are not assigned to this scheduled exam",
    });

    return false;
  }

  return true;
};

// =====================================================
// Create System
// POST /api/systems
// Admin + Operator
// =====================================================

export const createSystem = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const {
      name,
      systemNumber,
      labName,
      ipAddress,
      macAddress,
      notes,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      systemNumber === undefined ||
      systemNumber === null ||
      String(systemNumber).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "name and systemNumber are required",
      });
    }

    const normalizedName = name.trim();

    const existingName = await System.findOne({
      name: normalizedName,
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "System name already exists",
      });
    }

    const existingNumber = await System.findOne({
      systemNumber,
    });

    if (existingNumber) {
      return res.status(409).json({
        success: false,
        message: "System number already exists",
      });
    }

    const system = await System.create({
      name: normalizedName,
      systemNumber,
      labName: labName ?? "",
      ipAddress: ipAddress ?? "",
      macAddress: macAddress ?? "",
      notes: notes ?? "",
      status: "available",
      currentScheduledExam: null,
    });

    return res.status(201).json({
      success: true,
      message: "System created successfully",
      system,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A system with the same unique name or number already exists",
      });
    }

    return sendServerError(
      res,
      "Failed to create system",
      error
    );
  }
};

// =====================================================
// Get All Systems
// GET /api/systems
// Admin + Operator
// =====================================================

export const getAllSystems = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const systems = await System.find()
      .populate(
        "currentScheduledExam",
        "examId studentId examDate startTime endTime status"
      )
      .sort({ systemNumber: 1 });

    return res.status(200).json({
      success: true,
      count: systems.length,
      systems,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to fetch systems",
      error
    );
  }
};

// =====================================================
// Get Available Systems
// GET /api/systems/available
// Admin + Operator
// =====================================================

export const getAvailableSystems = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const systems = await System.find({
      status: "available",
      currentScheduledExam: null,
    }).sort({ systemNumber: 1 });

    return res.status(200).json({
      success: true,
      count: systems.length,
      systems,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to fetch available systems",
      error
    );
  }
};

// =====================================================
// Get System By ID
// GET /api/systems/:id
// Admin + Operator
// =====================================================

export const getSystemById = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid system ID",
      });
    }

    const system = await System.findById(id).populate(
      "currentScheduledExam",
      "examId studentId examDate startTime endTime status"
    );

    if (!system) {
      return res.status(404).json({
        success: false,
        message: "System not found",
      });
    }

    return res.status(200).json({
      success: true,
      system,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to fetch system",
      error
    );
  }
};

// =====================================================
// Update System
// PUT /api/systems/:id
// Admin + Operator
// =====================================================

export const updateSystem = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const { id } = req.params;

    const {
      name,
      systemNumber,
      labName,
      ipAddress,
      macAddress,
      status,
      notes,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid system ID",
      });
    }

    if (
      status !== undefined &&
      !["available", "occupied"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid system status",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "System name cannot be empty",
      });
    }

    const system = await System.findById(id);

    if (!system) {
      return res.status(404).json({
        success: false,
        message: "System not found",
      });
    }

    if (
      status === "available" &&
      system.currentScheduledExam
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot mark an allocated system as available. Release it first.",
      });
    }

    if (
      status === "occupied" &&
      !system.currentScheduledExam
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Use the allocation endpoint to occupy a system.",
      });
    }

    if (name !== undefined) {
      const normalizedName = name.trim();

      const duplicateName = await System.findOne({
        name: normalizedName,
        _id: { $ne: id },
      });

      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message: "System name already exists",
        });
      }

      system.name = normalizedName;
    }

    if (systemNumber !== undefined) {
      const duplicateNumber = await System.findOne({
        systemNumber,
        _id: { $ne: id },
      });

      if (duplicateNumber) {
        return res.status(409).json({
          success: false,
          message: "System number already exists",
        });
      }

      system.systemNumber = systemNumber;
    }

    if (labName !== undefined) {
      system.labName = labName;
    }

    if (ipAddress !== undefined) {
      system.ipAddress = ipAddress;
    }

    if (macAddress !== undefined) {
      system.macAddress = macAddress;
    }

    if (status !== undefined) {
      system.status = status;
    }

    if (notes !== undefined) {
      system.notes = notes;
    }

    await system.save();

    return res.status(200).json({
      success: true,
      message: "System updated successfully",
      system,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A system with the same unique name or number already exists",
      });
    }

    return sendServerError(
      res,
      "Failed to update system",
      error
    );
  }
};

// =====================================================
// Allocate System To Scheduled Exam
// PUT /api/systems/:id/allocate
// Assigned invigilator only
// =====================================================

export const allocateSystemToExam = async (req, res) => {
  try {
    if (!requireInvigilator(req, res)) return;

    const { id } = req.params;
    const { scheduledExamId } = req.body;

    if (!scheduledExamId) {
      return res.status(400).json({
        success: false,
        message: "scheduledExamId is required",
      });
    }

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(scheduledExamId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid system ID or scheduled exam ID",
      });
    }

    const scheduledExam = await ScheduledExam.findById(
      scheduledExamId
    );

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message: "Scheduled exam not found",
      });
    }

    if (
      !canInvigilatorAccessExam(
        scheduledExam,
        req,
        res
      )
    ) {
      return;
    }

    if (scheduledExam.attendanceStatus !== "verified") {
      return res.status(400).json({
        success: false,
        message:
          "Student attendance must be verified before system allocation",
      });
    }

    if (scheduledExam.allocatedSystem) {
      return res.status(409).json({
        success: false,
        message:
          "A system is already allocated to this scheduled exam",
      });
    }

    // Atomically claim an available system.
    const system = await System.findOneAndUpdate(
      {
        _id: id,
        status: "available",
        $or: [
          { currentScheduledExam: null },
          { currentScheduledExam: { $exists: false } },
        ],
      },
      {
        $set: {
          status: "occupied",
          currentScheduledExam: scheduledExam._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!system) {
      const systemExists = await System.exists({ _id: id });

      if (!systemExists) {
        return res.status(404).json({
          success: false,
          message: "System not found",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This system is not available",
      });
    }

    try {
      scheduledExam.allocatedSystem = system.name;
      scheduledExam.allocatedAt = new Date();

      await scheduledExam.save();
    } catch (saveError) {
      // Roll back the system if saving the exam fails.
      await System.updateOne(
        {
          _id: system._id,
          currentScheduledExam: scheduledExam._id,
        },
        {
          $set: {
            status: "available",
            currentScheduledExam: null,
          },
        }
      );

      throw saveError;
    }

    return res.status(200).json({
      success: true,
      message: "System allocated successfully",
      system,
      scheduledExam,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to allocate system",
      error
    );
  }
};

// =====================================================
// Release System
// PUT /api/systems/:id/release
// Assigned invigilator only
// =====================================================

export const releaseSystem = async (req, res) => {
  try {
    if (!requireInvigilator(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid system ID",
      });
    }

    const system = await System.findById(id);

    if (!system) {
      return res.status(404).json({
        success: false,
        message: "System not found",
      });
    }

    if (!system.currentScheduledExam) {
      return res.status(400).json({
        success: false,
        message: "This system is not currently allocated",
      });
    }

    const scheduledExam = await ScheduledExam.findById(
      system.currentScheduledExam
    );

    if (!scheduledExam) {
      return res.status(409).json({
        success: false,
        message:
          "Linked scheduled exam not found. Contact an administrator.",
      });
    }

    if (
      !canInvigilatorAccessExam(
        scheduledExam,
        req,
        res
      )
    ) {
      return;
    }

    // Release only if still linked to this scheduled exam.
    const releasedSystem = await System.findOneAndUpdate(
      {
        _id: id,
        currentScheduledExam: scheduledExam._id,
        status: "occupied",
      },
      {
        $set: {
          status: "available",
          currentScheduledExam: null,
          lastUsedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!releasedSystem) {
      return res.status(409).json({
        success: false,
        message:
          "System allocation changed. Refresh and try again.",
      });
    }

    try {
      scheduledExam.allocatedSystem = null;
      scheduledExam.allocatedAt = null;

      await scheduledExam.save();
    } catch (saveError) {
      // Restore system state if saving exam fails.
      await System.updateOne(
        {
          _id: releasedSystem._id,
          status: "available",
          currentScheduledExam: null,
        },
        {
          $set: {
            status: "occupied",
            currentScheduledExam: scheduledExam._id,
          },
          $unset: {
            lastUsedAt: "",
          },
        }
      );

      throw saveError;
    }

    return res.status(200).json({
      success: true,
      message: "System released successfully",
      system: releasedSystem,
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to release system",
      error
    );
  }
};

// =====================================================
// Delete System
// DELETE /api/systems/:id
// Admin + Operator
// =====================================================

export const deleteSystem = async (req, res) => {
  try {
    if (!requireAdminOrOperator(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid system ID",
      });
    }

    const system = await System.findById(id);

    if (!system) {
      return res.status(404).json({
        success: false,
        message: "System not found",
      });
    }

    if (
      system.currentScheduledExam ||
      system.status === "occupied"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete an allocated system. Release it first.",
      });
    }

    await System.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "System deleted successfully",
    });
  } catch (error) {
    return sendServerError(
      res,
      "Failed to delete system",
      error
    );
  }
};
