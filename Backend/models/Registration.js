const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
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

    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },

        credits: {
          type: Number,
          required: true,
        },
      },
    ],

    totalCredits: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Confirmed", "Completed"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  },
);

registrationSchema.index(
  {
    student: 1,
    semester: 1,
    academicYear: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Registration", registrationSchema);
