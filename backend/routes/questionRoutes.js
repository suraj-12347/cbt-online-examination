import express from "express";

import {
  createQuestion,
  getAllQuestions,
  getQuestionsBySection,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminOrOperatorMiddleware from "../middleware/dminOrOperatorMiddleware.js";
import uploadQuestionImages from "../middleware/questionUploadMiddleware.js";

const router = express.Router();

// Create Question — Admin + Operator
router.post(
  "/",
  authMiddleware,
  adminOrOperatorMiddleware,
  uploadQuestionImages.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "optionImage_0", maxCount: 1 },
    { name: "optionImage_1", maxCount: 1 },
    { name: "optionImage_2", maxCount: 1 },
    { name: "optionImage_3", maxCount: 1 },
  ]),
  createQuestion
);

// Get All Questions — Login required
router.get(
  "/",
  authMiddleware,
  getAllQuestions
);

// Get Questions By Section — Login required
router.get(
  "/section/:sectionId",
  authMiddleware,
  getQuestionsBySection
);

// Get Single Question — Login required
router.get(
  "/:id",
  authMiddleware,
  getQuestionById
);

// Update Question — Admin + Operator
router.put(
  "/:id",
  authMiddleware,
  adminOrOperatorMiddleware,
  uploadQuestionImages.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "optionImage_0", maxCount: 1 },
    { name: "optionImage_1", maxCount: 1 },
    { name: "optionImage_2", maxCount: 1 },
    { name: "optionImage_3", maxCount: 1 },
  ]),
  updateQuestion
);

// Delete Question — Admin + Operator
router.delete(
  "/:id",
  authMiddleware,
  adminOrOperatorMiddleware,
  deleteQuestion
);

export default router;