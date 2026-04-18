const mysql = require('mysql2/promise');
require('dotenv').config();

async function auditLocalDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const tables = ['eventos', 'expositores', 'actividades', 'precios_entrada', 'evento_galeria', 'evento_compartir'];
  
  console.log('--- ACTUAL LOCAL DATABASE AUDIT ---');
  for (const table of tables) {
    console.log(`\nTable: ${table}`);
    try {
      const [columns] = await connection.query(`DESCRIBE ${table}`);
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } catch (e) {
      console.log(`  !! Table not found or error: ${e.message}`);
    }
  }

  await connection.end();
}

auditLocalDB().catch(console.error);
