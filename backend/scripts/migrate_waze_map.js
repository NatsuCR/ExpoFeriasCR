/**
 * migrate_waze_map.js
 * Adds the mapa_waze_embed column to the eventos table.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expoferiascr'
  });

  try {
    console.log('Adding mapa_waze_embed column...');
    await connection.query(`
      ALTER TABLE eventos 
      ADD COLUMN mapa_waze_embed TEXT AFTER mapa_embed;
    `);
    console.log('Column added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists, skipping.');
    } else {
      console.error('Error during migration:', err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
