const calculateSWA = require("./calculateSWA");
const calculateCWA = require("./calculateCWA");

/**
 * Generate Academic Report Data
 *
 * @param {Object} student - Student information
 * @param {Array} courses - Current semester courses with marks
 * @param {Array} previousRecords - Previous semester records
 * @returns {Object} Complete academic report
 */

const generateReport = (student, courses = [], previousRecords = []) => {
  // Calculate current semester SWA
  const swaResult = calculateSWA(courses);

  // Calculate cumulative weighted average
  const cwa = calculateCWA(previousRecords);

  // If the current semester is also included,
  // calculate CWA using current + previous records.
  const currentRecord = {
    weightedTotal: swaResult.weightedTotal,
    totalCredits: swaResult.totalCredits,
  };

  const allRecords = [...previousRecords, currentRecord];

  const finalCWA = calculateCWA(allRecords);

  return {
    student: {
      rollNo: student.rollNo,
      name: student.name,
      address: student.address,
      semester: student.semester,
    },

    courses: courses.map((course) => ({
      courseNo: course.courseNo,
      courseName: course.courseName,
      credits: Number(course.credits) || 0,
      marks: Number(course.marks) || 0,
      grade: course.grade || "",
      weightedMarks:
        (Number(course.marks) || 0) * (Number(course.credits) || 0),
    })),

    currentSemester: {
      weightedTotal: swaResult.weightedTotal,
      totalCredits: swaResult.totalCredits,
      swa: swaResult.swa,
      standing: swaResult.standing,
    },

    cumulative: {
      cwa: finalCWA,
    },

    previousSemesters: previousRecords.map((record) => ({
      semester: record.semester,
      academicYear: record.academicYear,
      totalCredits: record.totalCredits,
      weightedTotal: record.weightedTotal,
      swa: record.swa,
      standing: record.standing,
    })),
  };
};

module.exports = generateReport;
