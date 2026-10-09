/**
 * Calculate Cumulative Weighted Average (CWA)
 *
 * Formula:
 * CWA = Σ(Semester Weighted Total) / Σ(Semester Credits)
 *
 * @param {Array} semesterRecords
 * @returns {Number} CWA
 */

const calculateCWA = (semesterRecords) => {
  if (!Array.isArray(semesterRecords) || semesterRecords.length === 0) {
    return 0;
  }

  let totalWeightedMarks = 0;
  let totalCredits = 0;

  semesterRecords.forEach((record) => {
    const weightedTotal = Number(record.weightedTotal) || 0;
    const credits = Number(record.totalCredits) || 0;

    totalWeightedMarks += weightedTotal;
    totalCredits += credits;
  });

  if (totalCredits === 0) {
    return 0;
  }

  return Number((totalWeightedMarks / totalCredits).toFixed(2));
};

module.exports = calculateCWA;
