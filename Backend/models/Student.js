const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
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

    registeredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    currentSWA: {
      type: Number,
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
      default: "Normal Academic Standing",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Student", studentSchema);
