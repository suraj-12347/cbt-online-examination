import express from "express";

import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Create Exam - Admin
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createExam
);

// Get All Exams - Login User
router.get(
  "/",
  authMiddleware,
  getAllExams
);

// Get Single Exam - Login User
router.get(
  "/:id",
  authMiddleware,
  getExamById
);

// Update Exam - Admin
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateExam
);

// Delete Exam - Admin
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteExam
);

export default router;