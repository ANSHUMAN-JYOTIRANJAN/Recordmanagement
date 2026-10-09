const bcrypt = require("bcryptjs");
const { timingSafeEqual } = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Student = require("../models/Student");
const staffRoles = ["Academic Office", "Course Administrator", "Faculty"];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// ===============================
// Register User
// ===============================
const registerUser = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, email, password, rollNo, address, semester } =
      body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedRollNo =
      typeof rollNo === "string" ? rollNo.trim() : "";
    const semesterNumber = Number(semester);

    // Validate required account fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !normalizedEmail ||
      typeof password !== "string" ||
      !password ||
      !normalizedRollNo
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and roll number are required.",
      });
    }

    if (body.role && body.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Public registration is only available for student accounts.",
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Check roll number if provided
    const [existingRollNo, existingStudent] = await Promise.all([
      User.findOne({ rollNo: normalizedRollNo }),
      Student.findOne({ rollNo: normalizedRollNo }),
    ]);

    if (existingRollNo) {
      return res.status(409).json({
        success: false,
        message: "A user with this roll number already exists.",
      });
    }

    if (
      existingStudent &&
      existingStudent.name.toLowerCase() !== name.trim().toLowerCase()
    ) {
      return res.status(409).json({
        success: false,
        message: "The name does not match the student record for this roll number.",
      });
    }

    if (!existingStudent) {
      if (typeof address !== "string" || !address.trim() || !semester) {
        return res.status(400).json({
          success: false,
          message:
            "Address and semester are required to create a new student profile.",
        });
      }

      if (
        !Number.isInteger(semesterNumber) ||
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester must be a number between 1 and 8.",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let student = existingStudent;
    let createdStudent = false;
    if (!student) {
      student = await Student.create({
        rollNo: normalizedRollNo,
        name: name.trim(),
        address: address.trim(),
        semester: semesterNumber,
      });
      createdStudent = true;
    }

    let user;
    try {
      user = await User.create({
        name: student.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "Student",
        rollNo: normalizedRollNo,
      });
    } catch (error) {
      if (createdStudent) {
        await Student.deleteOne({ _id: student._id });
      }
      throw error;
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account or student record already uses this email or roll number.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register user.",
    });
  }
};

const createStudentProfile = async (req, res) => {
  try {
    if (req.user.role !== "Student" || !req.user.rollNo) {
      return res.status(403).json({
        success: false,
        message: "Only students with an assigned roll number can create a profile.",
      });
    }

    const { address, semester } = req.body || {};
    const semesterNumber = Number(semester);
    if (
      typeof address !== "string" ||
      !address.trim() ||
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Address and a semester from 1 to 8 are required.",
      });
    }

    const existingStudent = await Student.findOne({
      rollNo: req.user.rollNo,
    });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "A student profile already exists for this roll number.",
      });
    }

    const student = await Student.create({
      rollNo: req.user.rollNo,
      name: req.user.name,
      address: address.trim(),
      semester: semesterNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Student profile created successfully.",
      student,
    });
  } catch (error) {
    console.error("Create student profile error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A student profile already exists for this roll number.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create student profile.",
    });
  }
};

// ===============================
// Login User
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check active status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ===============================
// Get Current User
// ===============================
const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        rollNo: req.user.rollNo || null,
        isActive: req.user.isActive,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get current user.",
    });
  }
};

// ===============================
// Create Staff Account
// Academic Office / Course Administrator / Faculty
// ===============================
const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required.",
      });
    }

    if (!staffRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create staff account.",
    });
  }
};

const setupInitialStaffUser = async (req, res) => {
  try {
    const expectedSecret = process.env.STAFF_SETUP_SECRET;
    if (!expectedSecret) {
      return res.status(503).json({
        success: false,
        message: "Initial staff setup is not configured on the server.",
      });
    }

    const suppliedSecret = req.get("x-staff-setup-secret");
    if (typeof suppliedSecret !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid setup secret.",
      });
    }

    const expectedBuffer = Buffer.from(expectedSecret);
    const suppliedBuffer = Buffer.from(suppliedSecret);
    if (
      expectedBuffer.length !== suppliedBuffer.length ||
      !timingSafeEqual(expectedBuffer, suppliedBuffer)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid setup secret.",
      });
    }

    const { name, email, password } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and a password of at least 8 characters are required.",
      });
    }

    if (await User.exists({ role: { $in: staffRoles } })) {
      return res.status(409).json({
        success: false,
        message: "A staff account already exists. Initial setup is closed.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "Academic Office",
      isBootstrapStaff: true,
    });

    return res.status(201).json({
      success: true,
      message: "Initial Academic Office account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Initial staff setup error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Initial staff setup was already completed.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create initial staff account.",
    });
  }
};

module.exports = {
  registerUser,
  createStudentProfile,
  loginUser,
  getCurrentUser,
  createStaffUser,
  setupInitialStaffUser,
};
