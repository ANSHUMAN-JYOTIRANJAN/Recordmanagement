const express = require("express");

const {
  calculateStudentSWA,
  saveSWARecord,
  getSemesterRecords,
} = require("../controllers/swaController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Calculate SWA
// GET /api/swa
// ==========================================
router.get("/", protect, calculateStudentSWA);

// ==========================================
// Save Semester SWA Record
// POST /api/swa
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("Faculty", "Academic Office"),
  saveSWARecord,
);

// ==========================================
// Get Previous Semester Records
// GET /api/swa/:rollNo/records
// ==========================================
router.get("/:rollNo/records", protect, getSemesterRecords);

module.exports = router;
