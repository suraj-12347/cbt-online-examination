import express from "express";

import {
  calculateResult,
  getResultByAttempt,
  getAllResults,
  getResultById,
} from "../controllers/resultController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Calculate Result — Admin only
router.post(
  "/:attemptId/calculate",
  adminAuthMiddleware,
  calculateResult
);

// Get All Results — Admin only
router.get(
  "/",
  adminAuthMiddleware,
  getAllResults
);

// Get Result By ID — Admin only
router.get(
  "/id/:id",
  adminAuthMiddleware,
  getResultById
);

// Get Result By Attempt — Student access
// Yahan student auth + attempt ownership verification lagao.
router.get(
  "/:attemptId",
  getResultByAttempt,
  authMiddleware
);

export default router;