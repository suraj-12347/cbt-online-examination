import express from "express";

import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// =====================================================
// Register User
// =====================================================

router.post(
  "/register",
  upload.single("image"),
  registerUser
);


// =====================================================
// Login User
// =====================================================

router.post(
  "/login",
  loginUser
);


// =====================================================
// Get Logged-in User Profile
// =====================================================

router.get(
  "/profile",
  // authMiddleware,
  getUserProfile
);


// =====================================================
// Get All Users
// =====================================================

router.get(
  "/all",
  // authMiddleware,
  getAllUsers
);


// =====================================================
// Get User By ID
// =====================================================

router.get(
  "/:id",
  getUserById
);


// =====================================================
// Update User
// =====================================================

router.put(
  "/:id",
  upload.single("image"),
  updateUser
);


export default router;