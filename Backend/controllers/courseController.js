const Course = require("../models/Course");

// ==========================================
// Create Course
// ==========================================
const createCourse = async (req, res) => {
  try {
    const { courseNo, courseName, semester, credits, courseType, syllabus } =
      req.body;
    const semesterNumber = Number(semester);

    // Validate required fields
    if (
      !courseNo ||
      !courseName ||
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8 ||
      credits === undefined ||
      !courseType ||
      !syllabus
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course number, name, semester, credits, type and syllabus are required. Semester must be from 1 to 8.",
      });
    }

    const formattedCourseNo = courseNo.trim().toUpperCase();

    // Check duplicate course number
    const existingCourse = await Course.findOne({
      courseNo: formattedCourseNo,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course with this course number already exists.",
      });
    }

    // Create course
    const course = await Course.create({
      courseNo: formattedCourseNo,
      courseName: courseName.trim(),
      semester: semesterNumber,
      credits: Number(credits),
      courseType,
      syllabus: syllabus.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create course.",
    });
  }
};

// ==========================================
// Get All Courses
// ==========================================
const getCourses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.semester !== undefined) {
      const semester = Number(req.query.semester);
      if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
        return res.status(400).json({
          success: false,
          message: "Semester must be a number between 1 and 8.",
        });
      }
      filter.semester = semester;
    }

    const courses = await Course.find(filter).sort({ courseNo: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve courses.",
    });
  }
};

// ==========================================
// Get Course By Course Number
// ==========================================
const getCourseByNumber = async (req, res) => {
  try {
    const { courseNo } = req.params;

    const course = await Course.findOne({
      courseNo: courseNo.trim().toUpperCase(),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get course by number error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve course.",
    });
  }
};

// ==========================================
// Update Course
// ==========================================
const updateCourse = async (req, res) => {
  try {
    const { courseNo } = req.params;

    const { courseName, semester, credits, courseType, syllabus } = req.body;

    const course = await Course.findOne({
      courseNo: courseNo.trim().toUpperCase(),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Update only supplied fields
    if (courseName !== undefined) {
      course.courseName = courseName.trim();
    }

    if (semester !== undefined) {
      const semesterNumber = Number(semester);
      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester must be a number between 1 and 8.",
        });
      }
      course.semester = semesterNumber;
    }

    if (credits !== undefined) {
      course.credits = Number(credits);
    }

    if (courseType !== undefined) {
      course.courseType = courseType;
    }

    if (syllabus !== undefined) {
      course.syllabus = syllabus.trim();
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course,
    });
  } catch (error) {
    console.error("Update course error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update course.",
    });
  }
};

// ==========================================
// Delete Course
// ==========================================
const deleteCourse = async (req, res) => {
  try {
    const { courseNo } = req.params;

    const course = await Course.findOne({
      courseNo: courseNo.trim().toUpperCase(),
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    await Course.deleteOne({
      _id: course._id,
    });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error("Delete course error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete course.",
    });
  }
};

// ==========================================
// Search Courses
// ==========================================
const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const searchQuery = q.trim();

    const courses = await Course.find({
      $or: [
        {
          courseNo: {
            $regex: searchQuery,
            $options: "i",
          },
        },
        {
          courseName: {
            $regex: searchQuery,
            $options: "i",
          },
        },
      ],
    }).sort({
      courseNo: 1,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Search courses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to search courses.",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseByNumber,
  updateCourse,
  deleteCourse,
  searchCourses,
};
