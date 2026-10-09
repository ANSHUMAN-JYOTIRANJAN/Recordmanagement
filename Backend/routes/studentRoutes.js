const express = require("express");

const {
  createStudent,
  getStudents,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  searchStudents,
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Search Students
// GET /api/students/search?q=CS001
// ==========================================
router.get("/search", protect, searchStudents);

// ==========================================
// Get All Students
// GET /api/students
// ==========================================
router.get("/", protect, getStudents);

// ==========================================
// Create Student
// POST /api/students
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("Academic Office", "Course Administrator"),
  createStudent,
);

// ==========================================
// Get Student By Roll Number
// GET /api/students/:rollNo
// ==========================================
router.get("/:rollNo", protect, getStudentByRollNo);

// ==========================================
// Update Student
// PUT /api/students/:rollNo
// ==========================================
router.put(
  "/:rollNo",
  protect,
  authorizeRoles("Academic Office", "Course Administrator"),
  updateStudent,
);

// ==========================================
// Delete Student
// DELETE /api/students/:rollNo
// ==========================================
router.delete(
  "/:rollNo",
  protect,
  authorizeRoles("Academic Office"),
  deleteStudent,
);

module.exports = router;
