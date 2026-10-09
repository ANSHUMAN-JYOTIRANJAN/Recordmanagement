const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    courseType: {
      type: String,
      enum: ["Core", "Elective", "Laboratory", "Project"],
      required: true,
    },

    syllabus: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Course", courseSchema);
