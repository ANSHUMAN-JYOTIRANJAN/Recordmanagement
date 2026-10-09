const Student = require("../models/Student");
const Marks = require("../models/Marks");
const SemesterRecord = require("../models/SemesterRecord");

const generateReport = require("../utils/generateReport");

const getReportStats = async (req, res) => {
  try {
    const count = await SemesterRecord.countDocuments();
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Get report statistics error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve report statistics.",
    });
  }
};

// ==========================================
// Generate Academic Report Data
// ==========================================
const getAcademicReport = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { semester, academicYear } = req.query;

    // Validate required fields
    if (!rollNo || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, semester and academic year are required.",
      });
    }

    // Find student
    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Get current semester marks
    const marksRecords = await Marks.find({
      student: student._id,
      semester: Number(semester),
      academicYear: academicYear.trim(),
    })
      .populate("course", "courseNo courseName credits courseType")
      .sort({
        "course.courseNo": 1,
      });

    // Convert marks into report format
    const courses = marksRecords.map((record) => ({
      courseNo: record.course.courseNo,
      courseName: record.course.courseName,
      credits: record.credits,
      marks: record.marks,
      grade: record.grade,
      weightedMarks: record.weightedMarks,
    }));

    // Get previous semester records
    const previousRecords = await SemesterRecord.find({
      student: student._id,
      semester: {
        $lt: Number(semester),
      },
    }).sort({
      semester: 1,
    });

    // Generate complete report
    const report = generateReport(student, courses, previousRecords);

    res.status(200).json({
      success: true,
      message: "Academic report generated successfully.",
      report: {
        ...report,
        academicYear,
        semester: Number(semester),
      },
    });
  } catch (error) {
    console.error("Generate academic report error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate academic report.",
    });
  }
};

// ==========================================
// Get Previous Semester Reports
// ==========================================
const getPreviousReports = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const records = await SemesterRecord.find({
      student: student._id,
    }).sort({
      semester: 1,
    });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get previous reports error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve previous reports.",
    });
  }
};

// ==========================================
// Get Report Summary
// ==========================================
const getReportSummary = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const records = await SemesterRecord.find({
      student: student._id,
    }).sort({
      semester: 1,
    });

    res.status(200).json({
      success: true,
      student: {
        rollNo: student.rollNo,
        name: student.name,
        semester: student.semester,
      },
      currentSWA: student.currentSWA,
      cumulativeAverage: student.cumulativeAverage,
      standing: student.standing,
      totalSemesters: records.length,
      semesterRecords: records,
    });
  } catch (error) {
    console.error("Get report summary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve report summary.",
    });
  }
};

module.exports = {
  getReportStats,
  getAcademicReport,
  getPreviousReports,
  getReportSummary,
};
