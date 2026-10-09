const Registration = require("../models/Registration");
const Student = require("../models/Student");
const Course = require("../models/Course");

const registrationStaffRoles = [
  "Faculty",
  "Academic Office",
  "Course Administrator",
];

const canAccessStudentRegistration = (user, rollNo) =>
  registrationStaffRoles.includes(user.role) ||
  (user.role === "Student" && user.rollNo === rollNo);

// ==========================================
// Create / Update Registration
// ==========================================
const createRegistration = async (req, res) => {
  try {
    const { rollNo, semester, academicYear, courses } = req.body;

    // Validate required fields
    if (
      !rollNo ||
      !semester ||
      !academicYear ||
      !Array.isArray(courses)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Roll number, semester, academic year and a courses array are required.",
      });
    }

    if (!canAccessStudentRegistration(req.user, rollNo.trim())) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own course registration.",
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

    if (
      req.user.role === "Student" &&
      student.semester !== Number(semester)
    ) {
      return res.status(400).json({
        success: false,
        message: "Students can only register for their current semester.",
      });
    }

    // Find selected courses
    const courseIds = courses.map((course) => course.course);

    const courseDocuments = await Course.find({
      _id: { $in: courseIds },
    });

    if (courseDocuments.length !== courseIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected courses do not exist.",
      });
    }

    const wrongSemesterCourses = courseDocuments.filter(
      (course) => course.semester !== Number(semester),
    );
    if (wrongSemesterCourses.length) {
      return res.status(400).json({
        success: false,
        message: "All registered courses must belong to the selected semester.",
      });
    }

    // Prevent duplicate course registration
    const uniqueCourseIds = new Set(courseIds.map((id) => id.toString()));

    if (uniqueCourseIds.size !== courseIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate courses are not allowed.",
      });
    }

    // Calculate total credits
    let totalCredits = 0;

    const registrationCourses = courseDocuments.map((course) => {
      totalCredits += course.credits;

      return {
        course: course._id,
        credits: course.credits,
      };
    });

    // Maximum credit validation
    if (totalCredits > 30) {
      return res.status(400).json({
        success: false,
        message: "Total registered credits cannot exceed 30.",
      });
    }

    // Find existing registration
    let registration = await Registration.findOne({
      student: student._id,
      semester: Number(semester),
      academicYear: academicYear.trim(),
    });

    if (registration) {
      registration.courses = registrationCourses;
      registration.totalCredits = totalCredits;
      registration.status = "Draft";

      await registration.save();
    } else {
      registration = await Registration.create({
        student: student._id,
        semester: Number(semester),
        academicYear: academicYear.trim(),
        courses: registrationCourses,
        totalCredits,
        status: "Draft",
      });
    }

    // Update student's registered courses
    student.registeredCourses = courseDocuments.map((course) => course._id);

    await student.save();

    const populatedRegistration = await Registration.findById(registration._id)
      .populate("student", "rollNo name semester")
      .populate("courses.course", "courseNo courseName credits courseType");

    res.status(201).json({
      success: true,
      message: "Course registration saved successfully.",
      registration: populatedRegistration,
    });
  } catch (error) {
    console.error("Create registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save course registration.",
    });
  }
};

// ==========================================
// Get Student Registration
// ==========================================
const getRegistration = async (req, res) => {
  try {
    const { rollNo, semester, academicYear } = req.query;

    if (!rollNo || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, semester and academic year are required.",
      });
    }

    if (!canAccessStudentRegistration(req.user, rollNo.trim())) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own course registration.",
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

    const registration = await Registration.findOne({
      student: student._id,
      semester: Number(semester),
      academicYear: academicYear.trim(),
    })
      .populate("student", "rollNo name semester")
      .populate(
        "courses.course",
        "courseNo courseName credits courseType syllabus",
      );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration record not found.",
      });
    }

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Get registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve registration.",
    });
  }
};

// ==========================================
// Get All Registrations
// ==========================================
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("student", "rollNo name semester")
      .populate("courses.course", "courseNo courseName credits")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get all registrations error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve registrations.",
    });
  }
};

// ==========================================
// Confirm Registration
// ==========================================
const confirmRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId).populate(
      "student",
      "rollNo",
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    if (
      !registration.student ||
      !canAccessStudentRegistration(req.user, registration.student.rollNo)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only confirm your own course registration.",
      });
    }

    if (!registration.courses.length) {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm registration without courses.",
      });
    }

    registration.status = "Confirmed";

    await registration.save();

    res.status(200).json({
      success: true,
      message: "Course registration confirmed successfully.",
      registration,
    });
  } catch (error) {
    console.error("Confirm registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to confirm registration.",
    });
  }
};

// ==========================================
// Remove Registration
// ==========================================
const deleteRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    await Registration.deleteOne({
      _id: registration._id,
    });

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully.",
    });
  } catch (error) {
    console.error("Delete registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete registration.",
    });
  }
};

module.exports = {
  createRegistration,
  getRegistration,
  getAllRegistrations,
  confirmRegistration,
  deleteRegistration,
};
