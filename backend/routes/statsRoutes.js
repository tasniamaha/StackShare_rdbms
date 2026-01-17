const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../authMiddleware.js/auth.middleware");
const roleCheck = require("../authMiddleware.js/role.middleware");

/**
 * GET all audit logs (Admin-only)
 * Optional query params: userId, entity
 * Example: /api/audit?userId=2&entity=device
 */
router.get("/", auth, roleCheck("admin"), (req, res) => {
  const { userId, entity } = req.query;

  let sql = `SELECT * FROM audit_logs WHERE 1=1`;
  const params = [];

  if (userId) {
    sql += " AND user_id = ?";
    params.push(userId);
  }

  if (entity) {
    sql += " AND entity = ?";
    params.push(entity);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch audit logs", details: err });
    res.json(results);
  });
});

/**
 * POST a manual audit log (Admin-only)
 * Body: { userId, action, entity }
 */
router.post("/", auth, roleCheck("admin"), (req, res) => {
  const { userId, action, entity } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ message: "userId and action are required" });
  }

  const sql = `
    INSERT INTO audit_logs (user_id, action, entity, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [userId, action, entity || null], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to add audit log", details: err });
    res.status(201).json({ message: "Audit log added", logId: result.insertId });
  });
});

module.exports = router;
