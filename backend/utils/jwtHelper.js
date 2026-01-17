// utils/jwtHelper.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JwtHelper {
  // Generate token
  static generate(payload) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  }

  // Verify token
  static verify(token) {
    return jwt.verify(token, config.JWT_SECRET);
  }

  // Decode token (without verification)
  static decode(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtHelper;