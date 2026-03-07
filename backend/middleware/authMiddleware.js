// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Student = require("../models/Student");

/**
 * Authentication middleware
 * - verifies JWT and attaches the full student record to req.user
 * - if token is missing/invalid, rejects the request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Fetch latest user data from database so we have role/flags
    const user = await Student.findById(decoded.student_id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authMiddleware;
