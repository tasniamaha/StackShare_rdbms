// services/recommendationService.js
const pool = require('../config/database');

class RecommendationService {
  // Get recommendations for student
  static async getRecommendations(studentId) {
    // Get categories from borrow history
    const [categories] = await pool.execute(
      `SELECT DISTINCT d.device_category
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ?
       LIMIT 3`,
      [studentId]
    );

    if (categories.length === 0) {
      // No history - return popular devices
      return await this.getPopularDevices();
    }

    // Get available devices in those categories
    const categoryList = categories.map(c => c.device_category);
    const placeholders = categoryList.map(() => '?').join(',');
    
    const [devices] = await pool.execute(
      `SELECT * FROM devices
       WHERE device_category IN (${placeholders})
         AND device_status = 'Available'
       ORDER BY borrow_count DESC
       LIMIT 10`,
      categoryList
    );

    return devices;
  }

  // Get popular devices
  static async getPopularDevices() {
    const [devices] = await pool.execute(
      `SELECT * FROM devices
       WHERE device_status = 'Available'
       ORDER BY borrow_count DESC
       LIMIT 10`
    );
    return devices;
  }

  // Get similar devices
  static async getSimilarDevices(deviceId) {
    const [device] = await pool.execute(
      `SELECT device_category FROM devices WHERE device_id = ?`,
      [deviceId]
    );

    if (!device[0]) return [];

    const [similar] = await pool.execute(
      `SELECT * FROM devices
       WHERE device_category = ? AND device_id != ? AND device_status = 'Available'
       ORDER BY borrow_count DESC
       LIMIT 5`,
      [device[0].device_category, deviceId]
    );

    return similar;
  }
}

module.exports = RecommendationService;