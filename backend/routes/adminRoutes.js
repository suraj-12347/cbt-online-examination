import express from "express";

import {
  loginAdmin,
  getAdminProfile,
} from "../controllers/adminController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Admin Login
router.post("/login", loginAdmin);

// Admin Profile
router.get(
  "/profile",
//   adminAuthMiddleware,
  getAdminProfile
);

export default router;