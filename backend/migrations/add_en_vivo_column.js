const pool = require('../db');

async function migrate() {
  try {
    console.log('Agregando columna en_vivo a actividades...');
    await pool.query(`
      ALTER TABLE actividades 
      ADD COLUMN IF NOT EXISTS en_vivo TINYINT(1) DEFAULT 0
    `);
    console.log('Columna en_vivo agregada exitosamente.');
    process.exit(0);
  } catch (error) {
    // Si la columna ya existe, ignoramos el error
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('La columna en_vivo ya existe, nada que hacer.');
      process.exit(0);
    }
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();
