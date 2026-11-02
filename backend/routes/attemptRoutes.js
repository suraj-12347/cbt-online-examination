import express from "express";
import {
  startAttempt,
  getAttemptById,
  nextSection,
  submitAttempt,
  expireAttempt,
  getAllAttempts,
  getAttemptByIdAdmin,
} from "../controllers/attemptController.js";

import {
  saveAnswer,
  getAttemptAnswers,
  toggleMarkForReview,
} from "../controllers/answerController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// STUDENT ATTEMPT ROUTES
// ===============================

router.post("/start", authMiddleware, startAttempt);

router.get("/:id", authMiddleware, getAttemptById);

router.post("/:id/answer", authMiddleware, saveAnswer);

router.get("/:attemptId/answers", authMiddleware, getAttemptAnswers);

router.post("/:id/mark-review", authMiddleware, toggleMarkForReview);

router.post("/:id/next-section", authMiddleware, nextSection);

router.post("/:id/submit", authMiddleware, submitAttempt);

router.post("/:id/expire", authMiddleware, expireAttempt);


// ===============================
// ADMIN ATTEMPT ROUTES
// ===============================

router.get("/",
  //  authMiddleware,
   getAllAttempts);

router.get("/:id", 
  // authMiddleware,
   getAttemptByIdAdmin);

export default router;