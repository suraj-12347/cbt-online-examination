import express from "express";

import {
  createInvigilator,
  loginInvigilator,
  getAllInvigilators,
  getInvigilatorById,
  updateInvigilator,
  deleteInvigilator,
  getAssignedExams,
} from "../controllers/invigilatorController.js";

import upload from "../middleware/uploadMiddleware.js";
import invigilatorAuth from "../middleware/invigilatorAuth.js";

const router = express.Router();

// Public: login
router.post("/login", loginInvigilator);

// Admin-only routes:
// In production, protect these with your admin authentication middleware.
router.post("/", upload.single("image"), createInvigilator);
router.get("/", getAllInvigilators);
router.put("/:id", upload.single("image"), updateInvigilator);
router.delete("/:id", deleteInvigilator);

// Authenticated invigilator: own profile
router.get("/me", invigilatorAuth, (req, res) => {
  res.json({
    success: true,
    invigilator: req.invigilator,
  });
});

// Authenticated invigilator: assigned exams
// Authenticated invigilator: assigned exams
router.get(
  "/assigned-exams",
  invigilatorAuth,
  getAssignedExams
);
// Keep this route after the specific routes
router.get("/:id", invigilatorAuth, (req, res, next) => {
  if (req.params.id !== req.invigilatorId) {
    return res.status(403).json({
      success: false,
      message: "You cannot access another invigilator's profile",
    });
  }

  next();
}, getInvigilatorById);

export default router;