const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect MongoDB
connectDB();

// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working",
    database: "MongoDB",
  });
});

// ==========================================
// Import Routes
// ==========================================

const authRoutes = require("./routes/authRoutes");

const studentRoutes = require("./routes/studentRoutes");

const courseRoutes = require("./routes/courseRoutes");

const registrationRoutes = require("./routes/registrationRoutes");

const marksRoutes = require("./routes/marksRoutes");

const swaRoutes = require("./routes/swaRoutes");

const reportRoutes = require("./routes/reportRoutes");

// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/registrations", registrationRoutes);

app.use("/api/marks", marksRoutes);

app.use("/api/swa", swaRoutes);

app.use("/api/reports", reportRoutes);

app.use(express.static(path.join(__dirname, "..", "frontend")));

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log("=========================================");
});
