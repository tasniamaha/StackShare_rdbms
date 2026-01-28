// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const config = require('../config/config');

// Register
exports.register = async (req, res) => {
  try {
    const { student_id, student_name, student_email, student_dept, password } = req.body;

    // Check if email exists
    const emailExists = await Student.emailExists(student_email);
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if student ID exists
    const idExists = await Student.studentIdExists(student_id);
    if (idExists) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create student
    await Student.create({
      student_id,
      student_name,
      student_email,
      student_dept,
      password_hash
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { student_email, password } = req.body;

    // Find student
    const student = await Student.findByEmail(student_email);
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if suspended
    const isSuspended = await Student.isSuspended(student.student_id);
    if (isSuspended) {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    // Generate token
    const token = jwt.sign(
      { student_id: student.student_id, student_email: student.student_email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        student_id: student.student_id,
        student_name: student.student_name,
        student_email: student.student_email,
        student_dept: student.student_dept,
        reputation_score: student.reputation_score
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.getWithStats(req.user.student_id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { student_name, student_email, student_dept } = req.body;

    await Student.update(req.user.student_id, {
      student_name,
      student_email,
      student_dept
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};