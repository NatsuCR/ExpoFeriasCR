const pool = require('../backend/db');

async function audit() {
  try {
    console.log('--- AUDITORÍA DE ESTRUCTURA Y DATOS ---');
    
    // 1. Ver orden físico de las columnas
    const [columns] = await pool.query('SHOW COLUMNS FROM eventos');
    console.log('\n[Estructura Real]');
    columns.forEach((col, idx) => {
      console.log(`${idx + 1}: ${col.Field} (${col.Type})`);
    });

    // 2. Ver datos del último evento
    const [rows] = await pool.query('SELECT * FROM eventos ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
      console.log('\n[Datos del Último Evento (ID: ' + rows[0].id + ')]');
      const row = rows[0];
      for (const key in row) {
        console.log(`${key}: ${row[key]}`);
      }
    } else {
      console.log('\nNo hay eventos para auditar.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error en auditoría:', error);
    process.exit(1);
  }
}

audit();

