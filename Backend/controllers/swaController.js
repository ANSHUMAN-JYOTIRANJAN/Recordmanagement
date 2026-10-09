const Student = require("../models/Student");
const Marks = require("../models/Marks");
const SemesterRecord = require("../models/SemesterRecord");
const calculateSWA = require("../utils/calculateSWA");
const calculateCWA = require("../utils/calculateCWA");

const getStudentAndMarks = async (rollNo, semester, academicYear) => {
  const student = await Student.findOne({ rollNo: rollNo.trim() });
  if (!student) return { student: null, marks: [] };

  const marks = await Marks.find({
    student: student._id,
    semester: Number(semester),
    academicYear: academicYear.trim(),
  })
    .populate("course", "courseNo courseName credits courseType")
    .sort({ createdAt: 1 });

  return { student, marks };
};

const canAccessSWA = (user, rollNo) =>
  user.role !== "Student" || user.rollNo === rollNo.trim();

const calculateStudentSWA = async (req, res) => {
  try {
    const { rollNo, semester, academicYear } = req.query;
    if (!rollNo || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, semester and academic year are required.",
      });
    }

    if (!canAccessSWA(req.user, rollNo)) {
      return res.status(403).json({
        success: false,
        message: "You can only calculate SWA for your own student account.",
      });
    }

    const { student, marks } = await getStudentAndMarks(
      rollNo,
      semester,
      academicYear,
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }
    if (!marks.length) {
      return res.status(404).json({
        success: false,
        message:
          "No marks found for the selected semester and academic year. SWA is not available until marks are entered.",
      });
    }

    const courses = marks.map((record) => ({
      courseNo: record.course.courseNo,
      courseName: record.course.courseName,
      marks: record.marks,
      credits: record.credits,
      weightedMarks: record.weightedMarks,
    }));

    return res.status(200).json({
      success: true,
      student: {
        rollNo: student.rollNo,
        name: student.name,
        semester: student.semester,
      },
      courses,
      result: calculateSWA(courses),
    });
  } catch (error) {
    console.error("Calculate SWA error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate SWA.",
    });
  }
};

const saveSWARecord = async (req, res) => {
  try {
    const { rollNo, semester, academicYear } = req.body;
    if (!rollNo || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Roll number, semester and academic year are required.",
      });
    }

    const { student, marks } = await getStudentAndMarks(
      rollNo,
      semester,
      academicYear,
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }
    if (!marks.length) {
      return res.status(400).json({
        success: false,
        message: "Cannot save an SWA record without marks.",
      });
    }

    const result = calculateSWA(
      marks.map((record) => ({
        marks: record.marks,
        credits: record.credits,
      })),
    );

    const record = await SemesterRecord.findOneAndUpdate(
      {
        student: student._id,
        semester: Number(semester),
        academicYear: academicYear.trim(),
      },
      {
        student: student._id,
        semester: Number(semester),
        academicYear: academicYear.trim(),
        totalCredits: result.totalCredits,
        weightedTotal: result.weightedTotal,
        swa: result.swa,
        standing: result.standing,
      },
      { new: true, upsert: true, runValidators: true },
    );

    const records = await SemesterRecord.find({ student: student._id });
    const cumulativeAverage = calculateCWA(records);
    await Student.updateOne(
      { _id: student._id },
      {
        currentSWA: result.swa,
        cumulativeAverage,
        standing: result.standing,
      },
    );
    record.cumulativeAverage = cumulativeAverage;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "SWA record saved successfully.",
      record,
      result,
    });
  } catch (error) {
    console.error("Save SWA record error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save SWA record.",
    });
  }
};

const getSemesterRecords = async (req, res) => {
  try {
    if (!canAccessSWA(req.user, req.params.rollNo)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own semester records.",
      });
    }

    const student = await Student.findOne({ rollNo: req.params.rollNo.trim() });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const records = await SemesterRecord.find({ student: student._id }).sort({
      semester: 1,
    });
    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Get semester records error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve semester records.",
    });
  }
};

module.exports = {
  calculateStudentSWA,
  saveSWARecord,
  getSemesterRecords,
};
