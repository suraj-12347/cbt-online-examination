import express from "express";

import {
  createSection,
  getAllSections,
  getSectionsByExam,
  getSectionById,
  updateSection,
  deleteSection,
} from "../controllers/sectionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminOrOperatorMiddleware from "../middleware/dminOrOperatorMiddleware.js";

const router = express.Router();

// Admin and Operator authentication + role verification
router.use(authMiddleware, adminOrOperatorMiddleware);

// Get all sections
router.get("/", getAllSections);

// Get sections by exam
router.get("/exam/:examId", getSectionsByExam);

// Get single section
router.get("/:id", getSectionById);

// Create section
router.post("/", createSection);

// Update section
router.put("/:id", updateSection);

// Delete section
router.delete("/:id", deleteSection);

export default router;