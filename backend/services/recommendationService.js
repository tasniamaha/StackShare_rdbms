// services/recommendationService.js
const pool = require("../config/database");

class RecommendationService {
  // ================================
  // Get personalized recommendations for student
  // Called by: borrowerController.getRecommendations
  // BorrowerDashboard recommendations section
  //
  // Strategy:
  // 1. If user has borrow history: recommend devices in categories they've borrowed
  // 2. Excludes devices user is actively borrowing or has pending requests for
  // 3. If no history: show popular devices
  // ================================
  static async getRecommendations(studentId) {
    // Get categories student has borrowed before
    const [categories] = await pool.execute(
      `SELECT DISTINCT d.device_category
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ?
       LIMIT 3`,
      [studentId],
    );

    const categoryList = categories.map((c) => c.device_category);
    let recommendations = [];

    if (categoryList.length > 0) {
      // Has history — recommend from familiar categories
      const placeholders = categoryList.map(() => "?").join(",");
      const [devices] = await pool.execute(
        `SELECT d.device_id, d.device_name, d.device_category,
                d.condition_status, d.price_per_day,
                d.image_url, d.borrow_count,
                s.student_name AS owner_name
         FROM devices d
         LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
         LEFT JOIN students s        ON do2.owner_id = s.student_id
         WHERE d.device_category IN (${placeholders})
           AND d.device_status = 'Available'
           AND d.device_id NOT IN (
               SELECT device_id FROM borrow_requests
               WHERE student_id = ?
                 AND (borrow_status IN ('Borrowed','Overdue')
                      OR approval_status = 'Pending')
           )
         ORDER BY d.borrow_count DESC
         LIMIT 10`,
        [...categoryList, studentId],
      );
      recommendations = devices;
    } else {
      // No history — show most popular available devices
      const [devices] = await pool.execute(
        `SELECT d.device_id, d.device_name, d.device_category,
                d.condition_status, d.price_per_day,
                d.image_url, d.borrow_count,
                s.student_name AS owner_name
         FROM devices d
         LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
         LEFT JOIN students s        ON do2.owner_id = s.student_id
         WHERE d.device_status = 'Available'
         ORDER BY d.borrow_count DESC
         LIMIT 10`,
      );
      recommendations = devices;
    }

    return recommendations;
  }

  // ================================
  // Get popular devices
  // Called by: frontend or UI components for trending/popular section
  // ================================
  static async getPopularDevices() {
    const [devices] = await pool.execute(
      `SELECT d.device_id, d.device_name, d.device_category,
              d.condition_status, d.price_per_day,
              d.image_url, d.borrow_count,
              s.student_name AS owner_name
       FROM devices d
       LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
       LEFT JOIN students s        ON do2.owner_id = s.student_id
       WHERE d.device_status = 'Available'
       ORDER BY d.borrow_count DESC
       LIMIT 10`,
    );
    return devices;
  }

  // ================================
  // Get similar devices by category
  // Called by: DeviceDetails.js for "similar items" section
  // ================================
  static async getSimilarDevices(deviceId) {
    const [device] = await pool.execute(
      `SELECT device_category FROM devices WHERE device_id = ?`,
      [deviceId],
    );

    if (!device[0]) return [];

    const [similar] = await pool.execute(
      `SELECT d.device_id, d.device_name, d.device_category,
              d.condition_status, d.price_per_day,
              d.image_url, d.borrow_count,
              s.student_name AS owner_name
       FROM devices d
       LEFT JOIN device_owners do2 ON d.device_id  = do2.device_id
       LEFT JOIN students s        ON do2.owner_id = s.student_id
       WHERE d.device_category = ? 
         AND d.device_id != ? 
         AND d.device_status = 'Available'
       ORDER BY d.borrow_count DESC
       LIMIT 5`,
      [device[0].device_category, deviceId],
    );

    return similar;
  }
}

module.exports = RecommendationService;
