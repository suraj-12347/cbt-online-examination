import mongoose from "mongoose";

import ScheduledExam from "../models/scheduledExamModel.js";
import Exam from "../models/examModel.js";
import User from "../models/userModel.js";
import Invigilator from "../models/invigilatorModel.js";

// =====================================================
// START: AUTO UPDATE SCHEDULED EXAMS
// =====================================================
// scheduled -> active
// active -> completed
//
// Ye function:
// 1. Start time aate hi exam ko active karega
// 2. End time aate hi exam ko completed karega
// =====================================================

export const autoUpdateScheduledExams = async () => {
  try {
    const now = new Date();

    // =================================================
    // 1. SCHEDULED -> ACTIVE
    // =================================================

    const activated = await ScheduledExam.updateMany(
      {
        status: "scheduled",

        startTime: {
          $lte: now,
        },

        endTime: {
          $gt: now,
        },
      },
      {
        $set: {
          status: "active",
          accessGranted: true,
        },
      }
    );

    if (activated.modifiedCount > 0) {
      console.log(
        `Auto activated ${activated.modifiedCount} scheduled exam(s)`
      );
    }

    // =================================================
    // 2. SCHEDULED / ACTIVE -> COMPLETED
    // =================================================

    const completed = await ScheduledExam.updateMany(
      {
        status: {
          $in: ["scheduled", "active"],
        },

        endTime: {
          $lte: now,
        },
      },
      {
        $set: {
          status: "completed",
          accessGranted: false,
        },
      }
    );

    if (completed.modifiedCount > 0) {
      console.log(
        `Auto completed ${completed.modifiedCount} expired exam(s)`
      );
    }

    return {
      activated: activated.modifiedCount,
      completed: completed.modifiedCount,
    };
  } catch (error) {
    console.error(
      "Auto Update Scheduled Exams Error:",
      error
    );

    return null;
  }
};

// =====================================================
// BACKWARD COMPATIBILITY
// =====================================================
// Purane controllers me agar
// autoCompleteExpiredScheduledExams()
// call ho raha hai to bhi new function chalega.
// =====================================================

export const autoCompleteExpiredScheduledExams =
  autoUpdateScheduledExams;


// =====================================================
// START: Schedule Exam
// =====================================================

export const scheduleExam = async (req, res) => {
  try {
    const {
      examId,
      studentId,
      invigilatorId,
      examDate,
      startTime,
      endTime,
      notes,
    } = req.body;

    // -----------------------------------------
    // Required fields
    // -----------------------------------------

    if (
      !examId ||
      !studentId ||
      !invigilatorId ||
      !examDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam, student, invigilator, date, start time and end time are required",
      });
    }

    // -----------------------------------------
    // Validate ObjectIds
    // -----------------------------------------

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(invigilatorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invigilator ID",
      });
    }

    // -----------------------------------------
    // Check Exam
    // -----------------------------------------

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // -----------------------------------------
    // Check Student
    // -----------------------------------------

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // -----------------------------------------
    // Check Invigilator
    // -----------------------------------------

    const invigilator = await Invigilator.findById(
      invigilatorId
    );

    if (!invigilator) {
      return res.status(404).json({
        success: false,
        message: "Invigilator not found",
      });
    }

    if (invigilator.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Selected invigilator is inactive",
      });
    }

    // -----------------------------------------
    // Convert date/time
    // -----------------------------------------

    const start = new Date(startTime);
    const end = new Date(endTime);
    const date = new Date(examDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      Number.isNaN(date.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time",
      });
    }

    // -----------------------------------------
    // Start must be before End
    // -----------------------------------------

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // -----------------------------------------
    // Exam date should match start date
    // India timezone
    // -----------------------------------------

    const indiaDateFormatter = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

    const startDateString =
      indiaDateFormatter.format(start);

    const examDateString =
      indiaDateFormatter.format(date);

    if (startDateString !== examDateString) {
      return res.status(400).json({
        success: false,
        message:
          "Exam date and start time date must be the same",
      });
    }

    // -----------------------------------------
    // Prevent duplicate scheduling
    // -----------------------------------------

    const existingSchedule =
      await ScheduledExam.findOne({
        examId,
        studentId,
        status: {
          $nin: ["cancelled"],
        },
      });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message:
          "This student is already scheduled for this exam",
      });
    }

    // -----------------------------------------
    // Create Schedule
    // -----------------------------------------

    const scheduledExam =
      await ScheduledExam.create({
        examId,
        studentId,
        invigilatorId,

        examDate: date,
        startTime: start,
        endTime: end,

        status: "scheduled",

        attendanceStatus: "pending",

        verifiedAt: null,
        verifiedBy: null,

        allocatedSystem: null,
        allocatedAt: null,

        accessGranted: false,

        notes: notes || "",
      });

    // -----------------------------------------
    // Populate response
    // -----------------------------------------

    const populatedSchedule =
      await ScheduledExam.findById(
        scheduledExam._id
      )
        .populate(
          "examId",
          "title description duration totalMarks status"
        )
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        );

    return res.status(201).json({
      success: true,
      message: "Exam scheduled successfully",
      data: populatedSchedule,
    });
  } catch (error) {
    console.error(
      "Schedule Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to schedule exam",
      error: error.message,
    });
  }
};


// =====================================================
// START: Get All Scheduled Exams
// =====================================================

export const getAllScheduledExams = async (
  req,
  res
) => {
  try {
    // Auto update first
    await autoUpdateScheduledExams();

    const schedules =
      await ScheduledExam.find()
        .populate(
          "examId",
          "title duration totalMarks status"
        )
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        )
        .populate(
          "verifiedBy",
          "name email employeeId"
        )
        .sort({
          startTime: 1,
        });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error(
      "Get All Scheduled Exams Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch scheduled exams",
      error: error.message,
    });
  }
};


// =====================================================
// START: Get Scheduled Students By Exam
// =====================================================

export const getScheduledStudentsByExam = async (
  req,
  res
) => {
  try {
    await autoUpdateScheduledExams();

    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const schedules =
      await ScheduledExam.find({
        examId,
      })
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        )
        .populate(
          "verifiedBy",
          "name email employeeId"
        )
        .sort({
          startTime: 1,
        });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error(
      "Get Scheduled Students Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch scheduled students",
      error: error.message,
    });
  }
};


// =====================================================
// START: Get Student Scheduled Exams
// =====================================================

export const getStudentScheduledExams = async (
  req,
  res
) => {
  try {
    await autoUpdateScheduledExams();

    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const schedules =
      await ScheduledExam.find({
        studentId,
      })
        .populate(
          "examId",
          "title description duration totalMarks status"
        )
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        )
        .sort({
          startTime: 1,
        });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error(
      "Get Student Scheduled Exams Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch student scheduled exams",
      error: error.message,
    });
  }
};


// =====================================================
// START: Get Scheduled Exam By ID
// =====================================================

export const getScheduledExamById = async (
  req,
  res
) => {
  try {
    await autoUpdateScheduledExams();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid scheduled exam ID",
      });
    }

    const scheduledExam =
      await ScheduledExam.findById(id)
        .populate(
          "examId",
          "title description duration totalMarks status"
        )
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        )
        .populate(
          "verifiedBy",
          "name email employeeId"
        );

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scheduledExam,
    });
  } catch (error) {
    console.error(
      "Get Scheduled Exam By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch scheduled exam",
      error: error.message,
    });
  }
};


// =====================================================
// START: Update Scheduled Exam Status
// =====================================================

export const updateScheduledExamStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid scheduled exam ID",
      });
    }

    const allowedStatuses = [
      "scheduled",
      "active",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid exam status",
      });
    }

    const scheduledExam =
      await ScheduledExam.findById(id);

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    const now = new Date();

    // -----------------------------------------
    // Expired
    // -----------------------------------------

    if (
      ["scheduled", "active"].includes(
        scheduledExam.status
      ) &&
      now >= new Date(
        scheduledExam.endTime
      )
    ) {
      scheduledExam.status =
        "completed";

      scheduledExam.accessGranted =
        false;

      await scheduledExam.save();

      return res.status(400).json({
        success: false,
        message:
          "Exam end time has already passed. Exam marked as completed.",
        data: scheduledExam,
      });
    }

    // -----------------------------------------
    // Cancelled cannot activate
    // -----------------------------------------

    if (
      scheduledExam.status ===
        "cancelled" &&
      status === "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled exam cannot be activated",
      });
    }

    // -----------------------------------------
    // Completed cannot activate
    // -----------------------------------------

    if (
      scheduledExam.status ===
        "completed" &&
      status === "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed exam cannot be activated",
      });
    }

    // -----------------------------------------
    // Cannot activate after end
    // -----------------------------------------

    if (
      status === "active" &&
      now >=
        new Date(
          scheduledExam.endTime
        )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam end time has already passed",
      });
    }

    // -----------------------------------------
    // Update
    // -----------------------------------------

    scheduledExam.status =
      status;

    if (
      status === "active"
    ) {
      scheduledExam.accessGranted =
        true;
    }

    if (
      status === "cancelled" ||
      status === "completed"
    ) {
      scheduledExam.accessGranted =
        false;
    }

    await scheduledExam.save();

    // -----------------------------------------
    // Populate
    // -----------------------------------------

    const updatedSchedule =
      await ScheduledExam.findById(id)
        .populate(
          "examId",
          "title description duration totalMarks status"
        )
        .populate(
          "studentId",
          "name email rollNo course branch semester image"
        )
        .populate(
          "invigilatorId",
          "name email employeeId phone status"
        );

    return res.status(200).json({
      success: true,
      message:
        `Exam status changed to ${status}`,
      data: updatedSchedule,
    });
  } catch (error) {
    console.error(
      "Update Scheduled Exam Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update exam status",
      error: error.message,
    });
  }
};


// =====================================================
// START: Verify Attendance
// =====================================================

export const verifyAttendance = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const scheduledExam =
      await ScheduledExam.findById(id);

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    // -----------------------------------------
    // Expired
    // -----------------------------------------

    if (
      ["scheduled", "active"].includes(
        scheduledExam.status
      ) &&
      new Date() >=
        new Date(
          scheduledExam.endTime
        )
    ) {
      scheduledExam.status =
        "completed";

      scheduledExam.accessGranted =
        false;

      await scheduledExam.save();

      return res.status(400).json({
        success: false,
        message:
          "Exam time has ended. Attendance cannot be verified.",
      });
    }

    // -----------------------------------------
    // Cancelled
    // -----------------------------------------

    if (
      scheduledExam.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled exam attendance cannot be verified",
      });
    }

    // -----------------------------------------
    // Invigilator
    // -----------------------------------------

    const { invigilatorId } =
      req.body;

    if (!invigilatorId) {
      return res.status(400).json({
        success: false,
        message:
          "Invigilator ID is required",
      });
    }

    if (
      String(
        scheduledExam.invigilatorId
      ) !==
      String(invigilatorId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this scheduled exam",
      });
    }

    // -----------------------------------------
    // Verify attendance
    // -----------------------------------------

    scheduledExam.attendanceStatus =
      "verified";

    scheduledExam.verifiedAt =
      new Date();

    scheduledExam.verifiedBy =
      invigilatorId;

    scheduledExam.accessGranted =
      false;

    await scheduledExam.save();

    return res.status(200).json({
      success: true,
      message:
        "Student attendance verified successfully",
      data: scheduledExam,
    });
  } catch (error) {
    console.error(
      "Verify Attendance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify attendance",
      error: error.message,
    });
  }
};


// =====================================================
// START: Mark Attendance Absent
// =====================================================

export const markAttendanceAbsent = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { invigilatorId } =
      req.body;

    const scheduledExam =
      await ScheduledExam.findById(id);

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    // -----------------------------------------
    // Check Invigilator
    // -----------------------------------------

    if (!invigilatorId) {
      return res.status(400).json({
        success: false,
        message:
          "Invigilator ID is required",
      });
    }

    if (
      String(
        scheduledExam.invigilatorId
      ) !==
      String(invigilatorId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this scheduled exam",
      });
    }

    // -----------------------------------------
    // Mark Absent
    // -----------------------------------------

    scheduledExam.attendanceStatus =
      "absent";

    scheduledExam.verifiedAt =
      new Date();

    scheduledExam.verifiedBy =
      invigilatorId;

    scheduledExam.accessGranted =
      false;

    await scheduledExam.save();

    return res.status(200).json({
      success: true,
      message:
        "Student marked as absent",
      data: scheduledExam,
    });
  } catch (error) {
    console.error(
      "Mark Attendance Absent Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark student absent",
      error: error.message,
    });
  }
};


// =====================================================
// START: Allocate System
// =====================================================

export const allocateSystem = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      systemName,
      invigilatorId,
    } = req.body;

    if (!systemName) {
      return res.status(400).json({
        success: false,
        message:
          "System name is required",
      });
    }

    if (!invigilatorId) {
      return res.status(400).json({
        success: false,
        message:
          "Invigilator ID is required",
      });
    }

    const scheduledExam =
      await ScheduledExam.findById(id);

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    // -----------------------------------------
    // Check expiry
    // -----------------------------------------

    if (
      ["scheduled", "active"].includes(
        scheduledExam.status
      ) &&
      new Date() >=
        new Date(
          scheduledExam.endTime
        )
    ) {
      scheduledExam.status =
        "completed";

      scheduledExam.accessGranted =
        false;

      await scheduledExam.save();

      return res.status(400).json({
        success: false,
        message:
          "Exam time has ended. System cannot be allocated.",
      });
    }

    // -----------------------------------------
    // Check Invigilator
    // -----------------------------------------

    if (
      String(
        scheduledExam.invigilatorId
      ) !==
      String(invigilatorId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this scheduled exam",
      });
    }

    // -----------------------------------------
    // Attendance
    // -----------------------------------------

    if (
      scheduledExam.attendanceStatus !==
      "verified"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student attendance must be verified before system allocation",
      });
    }

    // -----------------------------------------
    // Allocate System
    // -----------------------------------------

    scheduledExam.allocatedSystem =
      systemName;

    scheduledExam.allocatedAt =
      new Date();

    scheduledExam.accessGranted =
      false;

    await scheduledExam.save();

    return res.status(200).json({
      success: true,
      message:
        "System allocated successfully",
      data: scheduledExam,
    });
  } catch (error) {
    console.error(
      "Allocate System Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to allocate system",
      error: error.message,
    });
  }
};


// =====================================================
// START: Cancel Scheduled Exam
// =====================================================

export const cancelScheduledExam = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid scheduled exam ID",
      });
    }

    const scheduledExam =
      await ScheduledExam.findById(id);

    if (!scheduledExam) {
      return res.status(404).json({
        success: false,
        message:
          "Scheduled exam not found",
      });
    }

    // -----------------------------------------
    // Completed cannot cancel
    // -----------------------------------------

    if (
      scheduledExam.status ===
      "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed exam cannot be cancelled",
      });
    }

    scheduledExam.status =
      "cancelled";

    scheduledExam.accessGranted =
      false;

    await scheduledExam.save();

    return res.status(200).json({
      success: true,
      message:
        "Scheduled exam cancelled successfully",
      data: scheduledExam,
    });
  } catch (error) {
    console.error(
      "Cancel Scheduled Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel scheduled exam",
      error: error.message,
    });
  }
};