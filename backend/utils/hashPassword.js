// utils/hashPassword.js
const bcrypt = require('bcryptjs');

class HashPassword {
  // Hash password
  static async hash(password) {
    return await bcrypt.hash(password, 10);
  }

  // Compare password
  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = HashPassword;