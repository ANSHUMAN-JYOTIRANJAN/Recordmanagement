const express = require("express");

const {
  saveMarks,
  getStudentMarks,
  getMarksById,
  updateMarks,
  deleteMarks,
  getAllMarks,
} = require("../controllers/marksController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Get All Marks
// GET /api/marks
// ==========================================
router.get(
  "/",
  protect,
  authorizeRoles("Faculty", "Academic Office"),
  getAllMarks,
);

// ==========================================
// Get Student Marks
// GET /api/marks/student
// ==========================================
router.get("/student", protect, getStudentMarks);

// ==========================================
// Get Marks By ID
// GET /api/marks/:id
// ==========================================
router.get("/:id", protect, getMarksById);

// ==========================================
// Save Marks
// POST /api/marks
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("Faculty", "Academic Office"),
  saveMarks,
);

// ==========================================
// Update Marks
// PUT /api/marks/:id
// ==========================================
router.put(
  "/:id",
  protect,
  authorizeRoles("Faculty", "Academic Office"),
  updateMarks,
);

// ==========================================
// Delete Marks
// DELETE /api/marks/:id
// ==========================================
router.delete(
  "/:id",
  protect,
  authorizeRoles("Faculty", "Academic Office"),
  deleteMarks,
);

module.exports = router;
