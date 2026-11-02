import express from "express";

import {
  createSystem,
  getAllSystems,
  getAvailableSystems,
  getSystemById,
  updateSystem,
  allocateSystemToExam,
  releaseSystem,
  deleteSystem,
} from "../controllers/systemController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminOrOperatorMiddleware from "../middleware/dminOrOperatorMiddleware.js";
import invigilatorAuth from "../middleware/invigilatorAuth.js";

const router = express.Router();

const adminOperatorAccess = [
  authMiddleware,
  adminOrOperatorMiddleware,
];

router.post("/", ...adminOperatorAccess, createSystem);
router.get("/", ...adminOperatorAccess, getAllSystems);
router.get("/available", ...adminOperatorAccess, getAvailableSystems);
router.get("/:id", ...adminOperatorAccess, getSystemById);
router.put("/:id", ...adminOperatorAccess, updateSystem);
router.delete("/:id", ...adminOperatorAccess, deleteSystem);

// Invigilator-only routes
router.put("/:id/allocate", invigilatorAuth, allocateSystemToExam);
router.put("/:id/release", invigilatorAuth, releaseSystem);

export default router;