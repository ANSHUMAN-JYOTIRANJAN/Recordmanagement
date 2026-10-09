const express = require("express");

const {
  getReportStats,
  getAcademicReport,
  getPreviousReports,
  getReportSummary,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, getReportStats);

// ==========================================
// Generate Academic Report
// GET /api/reports/:rollNo
// ==========================================
router.get("/:rollNo", protect, getAcademicReport);

// ==========================================
// Get Previous Semester Reports
// GET /api/reports/:rollNo/previous
// ==========================================
router.get("/:rollNo/previous", protect, getPreviousReports);

// ==========================================
// Get Report Summary
// GET /api/reports/:rollNo/summary
// ==========================================
router.get("/:rollNo/summary", protect, getReportSummary);

module.exports = router;
