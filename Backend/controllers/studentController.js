const Student = require("../models/Student");

// ==========================================
// Create Student
// ==========================================
const createStudent = async (req, res) => {
  try {
    const { rollNo, name, address, semester } = req.body;

    // Validate required fields
    if (!rollNo || !name || !address || !semester) {
      return res.status(400).json({
        success: false,
        message: "Roll number, name, address and semester are required.",
      });
    }

    // Check duplicate roll number
    const existingStudent = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this roll number already exists.",
      });
    }

    // Create student
    const student = await Student.create({
      rollNo: rollNo.trim(),
      name: name.trim(),
      address: address.trim(),
      semester: Number(semester),
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student,
    });
  } catch (error) {
    console.error("Create student error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create student.",
    });
  }
};

// ==========================================
// Get All Students
// ==========================================
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("registeredCourses", "courseNo courseName credits")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve students.",
    });
  }
};

// ==========================================
// Get Student By Roll Number
// ==========================================
const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    }).populate("registeredCourses", "courseNo courseName credits courseType");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student by roll number error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve student.",
    });
  }
};

// ==========================================
// Update Student
// ==========================================
const updateStudent = async (req, res) => {
  try {
    const { rollNo } = req.params;

    const { name, address, semester } = req.body;

    const student = await Student.findOne({
      rollNo: rollNo.trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Update only supplied fields
    if (name !== undefined) {
      student.name = name.trim();
    }

    if (address !== undefined) {
      student.address = address.trim();
    }

    if (semester !== undefined) {
      student.semester = Number(semester);
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update student.",
    });
  }
};

// ==========================================
// Delete Student
// ==========================================
const deleteStudent = async (req, res) => {
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

    await Student.deleteOne({
      _id: student._id,
    });

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete student error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete student.",
    });
  }
};

// ==========================================
// Search Students
// ==========================================
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const searchQuery = q.trim();

    const students = await Student.find({
      $or: [
        {
          rollNo: {
            $regex: searchQuery,
            $options: "i",
          },
        },
        {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        },
      ],
    })
      .populate("registeredCourses", "courseNo courseName credits")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Search students error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to search students.",
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
  searchStudents,
};
