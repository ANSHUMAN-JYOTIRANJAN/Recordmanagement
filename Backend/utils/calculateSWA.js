/**
 * Calculate Semester Weighted Average (SWA)
 *
 * Formula:
 * SWA = Σ(Marks × Credits) / Σ Credits
 *
 * @param {Array} courses - Array of courses containing marks and credits
 * @returns {Object} SWA calculation result
 */

const calculateSWA = (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return {
      weightedTotal: 0,
      totalCredits: 0,
      swa: 0,
      standing: "Normal Academic Standing",
    };
  }

  let weightedTotal = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    const marks = Number(course.marks) || 0;
    const credits = Number(course.credits) || 0;

    weightedTotal += marks * credits;
    totalCredits += credits;
  });

  const swa =
    totalCredits > 0 ? Number((weightedTotal / totalCredits).toFixed(2)) : 0;

  let standing;

  if (swa >= 85) {
    standing = "Vice-Chancellor's List";
  } else if (swa >= 50) {
    standing = "Normal Academic Standing";
  } else {
    standing = "Conditional Standing";
  }

  return {
    weightedTotal,
    totalCredits,
    swa,
    standing,
  };
};

module.exports = calculateSWA;
