const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
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

    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    grade: {
      type: String,
      enum: ["A", "B", "C", "F"],
      required: true,
    },

    credits: {
      type: Number,
      required: true,
      min: 1,
    },

    weightedMarks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

marksSchema.index(
  {
    student: 1,
    course: 1,
    semester: 1,
    academicYear: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Marks", marksSchema);
