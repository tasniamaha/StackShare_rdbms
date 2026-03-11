// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Student = require("../models/Student");

/**
 * Authentication middleware
 * - verifies JWT and attaches the full student record to req.user
 * - reads optional X-Dashboard-Context header ('borrower' | 'owner')
 *   to temporarily scope can_borrow / can_lend for that request only
 *   (does NOT modify the database)
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

    // Apply dashboard context override (does not touch DB)
    // Frontend sends X-Dashboard-Context: borrower | owner | both
    const context = req.headers["x-dashboard-context"];
    if (context === "borrower") {
      user.can_lend = false;   // on borrower dashboard → cannot act as owner
    } else if (context === "owner") {
      user.can_borrow = false; // on owner dashboard → cannot act as borrower
    }
    // If context is absent or 'both', keep DB values (both true for students)

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authMiddleware;