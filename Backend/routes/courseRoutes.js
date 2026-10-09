const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseByNumber,
  updateCourse,
  deleteCourse,
  searchCourses,
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Search Courses
// GET /api/courses/search?q=Operating
// ==========================================
router.get("/search", protect, searchCourses);

// ==========================================
// Get All Courses
// GET /api/courses
// ==========================================
router.get("/", protect, getCourses);

// ==========================================
// Create Course
// POST /api/courses
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("Course Administrator", "Academic Office"),
  createCourse,
);

// ==========================================
// Get Course By Course Number
// GET /api/courses/:courseNo
// ==========================================
router.get("/:courseNo", protect, getCourseByNumber);

// ==========================================
// Update Course
// PUT /api/courses/:courseNo
// ==========================================
router.put(
  "/:courseNo",
  protect,
  authorizeRoles("Course Administrator", "Academic Office"),
  updateCourse,
);

// ==========================================
// Delete Course
// DELETE /api/courses/:courseNo
// ==========================================
router.delete(
  "/:courseNo",
  protect,
  authorizeRoles("Course Administrator", "Academic Office"),
  deleteCourse,
);

module.exports = router;
