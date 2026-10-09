const Marks = require("../models/Marks");
const Student = require("../models/Student");
const Course = require("../models/Course");

// ==========================================
// Calculate Grade
// ==========================================
const calculateGrade = (marks) => {
  if (marks >= 85) {
    return "A";
  } else if (marks >= 70) {
    return "B";
  } else if (marks >= 50) {
    return "C";
  } else {
    return "F";
  }
};

// ==========================================
// Create / Update Marks
// ==========================================
const saveMarks = async (req, res) => {
  try {
    const { rollNo, courseNo, semester, academicYear, marks } = req.body;

    // Validate required fields
    if (
      !rollNo ||
      !courseNo ||
      !semester ||
      !academicYear ||
      marks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Roll number, course number, semester, academic year and marks are required.",
      });
    }

    const numericMarks = Number(marks);

    // Validate marks range
    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: "Marks must be between 0 and 100.",
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

    // Find course
    const course = await Course.findOne({
      courseNo: courseNo.trim().toUpperCase(),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (course.semester !== Number(semester)) {
      return res.status(400).json({
        success: false,
        message: "The course does not belong to the selected semester.",
      });
    }

    // Calculate grade
    const grade = calculateGrade(numericMarks);

    // Calculate weighted marks
    const weightedMarks = numericMarks * course.credits;

    // Check existing marks record
    let marksRecord = await Marks.findOne({
      student: student._id,
      course: course._id,
      semester: Number(semester),
      academicYear: academicYear.trim(),
    });

    if (marksRecord) {
      // Update existing record
      marksRecord.marks = numericMarks;
      marksRecord.grade = grade;
      marksRecord.credits = course.credits;
      marksRecord.weightedMarks = weightedMarks;

      await marksRecord.save();
    } else {
      // Create new record
      marksRecord = await Marks.create({
        student: student._id,
        course: course._id,
        semester: Number(semester),
        academicYear: academicYear.trim(),
        marks: numericMarks,
        grade,
        credits: course.credits,
        weightedMarks,
      });
    }

    const populatedMarks = await Marks.findById(marksRecord._id)
      .populate("student", "rollNo name semester")
      .populate("course", "courseNo courseName credits courseType");

    res.status(201).json({
      success: true,
      message: "Marks saved successfully.",
      marks: populatedMarks,
    });
  } catch (error) {
    console.error("Save marks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save marks.",
    });
  }
};

// ==========================================
// Get Marks For Student
// ==========================================
const getStudentMarks = async (req, res) => {
  try {
    const { rollNo, semester, academicYear } = req.query;

    if (!rollNo || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, semester and academic year are required.",
      });
    }

    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const marks = await Marks.find({
      student: student._id,
      semester: Number(semester),
      academicYear: academicYear.trim(),
    })
      .populate("course", "courseNo courseName credits courseType")
      .sort({
        "course.courseNo": 1,
      });

    res.status(200).json({
      success: true,
      count: marks.length,
      student: {
        rollNo: student.rollNo,
        name: student.name,
        semester: student.semester,
      },
      marks,
    });
  } catch (error) {
    console.error("Get student marks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve student marks.",
    });
  }
};

// ==========================================
// Get Single Marks Record
// ==========================================
const getMarksById = async (req, res) => {
  try {
    const { id } = req.params;

    const marks = await Marks.findById(id)
      .populate("student", "rollNo name semester")
      .populate("course", "courseNo courseName credits courseType");

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Marks record not found.",
      });
    }

    res.status(200).json({
      success: true,
      marks,
    });
  } catch (error) {
    console.error("Get marks by ID error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve marks record.",
    });
  }
};

// ==========================================
// Update Marks
// ==========================================
const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks } = req.body;

    if (marks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    const numericMarks = Number(marks);

    if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: "Marks must be between 0 and 100.",
      });
    }

    const marksRecord = await Marks.findById(id).populate("course");

    if (!marksRecord) {
      return res.status(404).json({
        success: false,
        message: "Marks record not found.",
      });
    }

    marksRecord.marks = numericMarks;
    marksRecord.grade = calculateGrade(numericMarks);

    marksRecord.weightedMarks = numericMarks * marksRecord.course.credits;

    await marksRecord.save();

    const updatedMarks = await Marks.findById(id)
      .populate("student", "rollNo name semester")
      .populate("course", "courseNo courseName credits");

    res.status(200).json({
      success: true,
      message: "Marks updated successfully.",
      marks: updatedMarks,
    });
  } catch (error) {
    console.error("Update marks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update marks.",
    });
  }
};

// ==========================================
// Delete Marks
// ==========================================
const deleteMarks = async (req, res) => {
  try {
    const { id } = req.params;

    const marks = await Marks.findById(id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Marks record not found.",
      });
    }

    await Marks.deleteOne({
      _id: id,
    });

    res.status(200).json({
      success: true,
      message: "Marks deleted successfully.",
    });
  } catch (error) {
    console.error("Delete marks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete marks.",
    });
  }
};

// ==========================================
// Get All Marks
// ==========================================
const getAllMarks = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate("student", "rollNo name semester")
      .populate("course", "courseNo courseName credits")
      .sort({
        semester: 1,
      });

    res.status(200).json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Get all marks error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve marks.",
    });
  }
};

module.exports = {
  saveMarks,
  getStudentMarks,
  getMarksById,
  updateMarks,
  deleteMarks,
  getAllMarks,
};
