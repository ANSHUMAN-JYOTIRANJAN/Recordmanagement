const express = require("express");

const {
  createRegistration,
  getRegistration,
  getAllRegistrations,
  confirmRegistration,
  deleteRegistration,
} = require("../controllers/registrationController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// Get Registration
// GET /api/registrations
// ==========================================
router.get("/", protect, getRegistration);

// ==========================================
// Get All Registrations
// GET /api/registrations/all
// ==========================================
router.get(
  "/all",
  protect,
  authorizeRoles("Faculty", "Academic Office", "Course Administrator"),
  getAllRegistrations,
);

// ==========================================
// Create / Update Registration
// POST /api/registrations
// ==========================================
router.post("/", protect, createRegistration);

// ==========================================
// Confirm Registration
// PUT /api/registrations/:registrationId/confirm
// ==========================================
router.put(
  "/:registrationId/confirm",
  protect,
  authorizeRoles("Faculty", "Academic Office", "Course Administrator"),
  confirmRegistration,
);

// ==========================================
// Delete Registration
// DELETE /api/registrations/:registrationId
// ==========================================
router.delete(
  "/:registrationId",
  protect,
  authorizeRoles("Academic Office", "Course Administrator"),
  deleteRegistration,
);

module.exports = router;
