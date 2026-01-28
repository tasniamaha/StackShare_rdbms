// controllers/recommendationController.js
const pool = require('../config/database');

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // Get categories from borrow history
    const [categories] = await pool.execute(
      `SELECT DISTINCT d.device_category
       FROM borrow_requests br
       JOIN devices d ON br.device_id = d.device_id
       WHERE br.student_id = ?
       LIMIT 3`,
      [student_id]
    );

    let recommendations = [];

    if (categories.length > 0) {
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
      recommendations = devices;
    } else {
      // No history - show popular devices
      const [devices] = await pool.execute(
        `SELECT * FROM devices
         WHERE device_status = 'Available'
         ORDER BY borrow_count DESC
         LIMIT 10`
      );
      recommendations = devices;
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get popular devices
exports.getPopularDevices = async (req, res) => {
  try {
    const [devices] = await pool.execute(
      `SELECT * FROM devices
       WHERE device_status = 'Available'
       ORDER BY borrow_count DESC
       LIMIT 10`
    );
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get similar devices
exports.getSimilarDevices = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Get device category
    const [device] = await pool.execute(
      `SELECT device_category FROM devices WHERE device_id = ?`,
      [deviceId]
    );

    if (!device[0]) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Get similar devices
    const [similar] = await pool.execute(
      `SELECT * FROM devices
       WHERE device_category = ? AND device_id != ? AND device_status = 'Available'
       ORDER BY borrow_count DESC
       LIMIT 5`,
      [device[0].device_category, deviceId]
    );

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};