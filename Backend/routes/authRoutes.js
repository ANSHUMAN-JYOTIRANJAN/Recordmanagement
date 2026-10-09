const express = require("express");

const {
  registerUser,
  createStudentProfile,
  createStaffUser,
  setupInitialStaffUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Register User
// POST /api/auth/register
// ==========================================
router.post("/register", registerUser);

// Complete the student record for an existing student account.
router.post("/student-profile", protect, createStudentProfile);

router.post("/setup-staff", setupInitialStaffUser);

router.post(
  "/staff",
  protect,
  authorizeRoles("Academic Office"),
  createStaffUser,
);

// ==========================================
// Login User
// POST /api/auth/login
// ==========================================
router.post("/login", loginUser);

// ==========================================
// Get Current User
// GET /api/auth/me
// ==========================================
router.get("/me", protect, getCurrentUser);

module.exports = router;
