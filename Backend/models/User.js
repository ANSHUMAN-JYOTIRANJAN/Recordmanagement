const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["Student", "Faculty", "Course Administrator", "Academic Office"],
      default: "Student",
    },

    rollNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBootstrapStaff: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { isBootstrapStaff: 1 },
  {
    unique: true,
    partialFilterExpression: { isBootstrapStaff: true },
  },
);

module.exports = mongoose.model("User", userSchema);
