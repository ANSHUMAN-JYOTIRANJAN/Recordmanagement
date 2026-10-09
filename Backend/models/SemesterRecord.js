const mongoose = require("mongoose");

const semesterRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    totalCredits: {
      type: Number,
      required: true,
      default: 0,
    },

    weightedTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    swa: {
      type: Number,
      required: true,
      default: 0,
    },

    cumulativeAverage: {
      type: Number,
      default: 0,
    },

    standing: {
      type: String,
      enum: [
        "Vice-Chancellor's List",
        "Normal Academic Standing",
        "Conditional Standing",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

semesterRecordSchema.index(
  {
    student: 1,
    semester: 1,
    academicYear: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("SemesterRecord", semesterRecordSchema);
