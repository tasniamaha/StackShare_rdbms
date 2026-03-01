// config/dbInit.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Connect without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('📦 Initializing database...');

    // Read and execute SQL files
    const sqlFiles = [
      'schema.sql',
      'triggers.sql',
      'views.sql',
      'procedures.sql',
      'constraints.sql'
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, '../../sql', file);
      
      if (fs.existsSync(filePath)) {
        console.log(`📄 Executing ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await connection.query(sql);
        console.log(`✅ ${file} executed successfully`);
      }
    }

    console.log('✅ Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;