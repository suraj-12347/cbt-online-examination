import express from "express";

import {
  scheduleExam,
  getAllScheduledExams,
  getScheduledStudentsByExam,
  getStudentScheduledExams,
  getScheduledExamById,
  updateScheduledExamStatus,
  verifyAttendance,
  markAttendanceAbsent,
  allocateSystem,
  cancelScheduledExam,
} from "../controllers/scheduledExamController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Schedule Exam — Admin only
router.post(
  "/",
  adminAuthMiddleware,
  scheduleExam
);

// Get All Scheduled Exams — Admin only
router.get(
  "/",
  adminAuthMiddleware,
  getAllScheduledExams
);

// Get Scheduled Students By Exam — Admin only
router.get(
  "/exam/:examId",
  adminAuthMiddleware,
  getScheduledStudentsByExam
);

// Get Student Scheduled Exams — Student authentication required
// Student auth + ownership verification apne controller/middleware mein lagao.
router.get(
  "/student/:studentId",
  getStudentScheduledExams
);

// Get Scheduled Exam By ID — Admin only
router.get(
  "/:id",
  adminAuthMiddleware,
  getScheduledExamById
);

// Update Scheduled Exam Status — Admin only
router.put(
  "/:id/status",
  adminAuthMiddleware,
  updateScheduledExamStatus
);

// Verify Attendance — Admin only
router.put(
  "/:id/verify-attendance",
  adminAuthMiddleware,
  verifyAttendance
);

// Mark Attendance Absent — Admin only
router.put(
  "/:id/absent",
  adminAuthMiddleware,
  markAttendanceAbsent
);

// Allocate System — Admin only
router.put(
  "/:id/allocate-system",
  adminAuthMiddleware,
  allocateSystem
);

// Cancel Scheduled Exam — Admin only
router.delete(
  "/:id",
  adminAuthMiddleware,
  cancelScheduledExam
);

export default router;