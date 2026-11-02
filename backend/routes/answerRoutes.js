import express from "express";

import {
  saveAnswer,
  getAttemptAnswers,
  toggleMarkForReview,
} from "../controllers/answerController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:attemptId/save",
  authMiddleware,
  saveAnswer
);

router.get(
  "/:attemptId",
  authMiddleware,
  getAttemptAnswers
);

router.post(
  "/:attemptId/mark-review",
  authMiddleware,
  toggleMarkForReview
);

export default router;