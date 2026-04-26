const pool = require('../backend/db');

async function migrate() {
  try {
    console.log('--- Iniciando Migración de Ubicaciones ---');
    
    const [columns] = await pool.query('SHOW COLUMNS FROM eventos');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('ciudad')) {
      await pool.query('ALTER TABLE eventos ADD COLUMN ciudad VARCHAR(100) AFTER distrito');
      console.log('✅ Columna ciudad añadida');
    }
    
    console.log('--- Migración Finalizada ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();

