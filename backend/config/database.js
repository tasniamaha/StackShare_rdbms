// config/database.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "StackShare",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

// Test the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connection established successfully");
    connection.release();
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  });

module.exports = pool;
