const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expoferiascr'
  });

  try {
    console.log('⌛ 1. Creando índice no-único para la relación...');
    // Primero creamos un índice normal para que la FK no se rompa
    await pool.query('ALTER TABLE precios_entrada ADD INDEX idx_evento_simple (evento_id)');
    
    console.log('⌛ 2. Eliminando el índice único restrictivo...');
    // Ahora sí borramos el que tiene la restricción de fecha
    await pool.query('ALTER TABLE precios_entrada DROP INDEX evento_id');
    
    console.log('✅ ¡Todo listo! Ahora la base de datos permite duplicar fechas.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();
