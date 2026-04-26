const pool = require('../backend/db');

async function migrate() {
  try {
    console.log('--- Iniciando Migración ---');
    
    const [columns] = await pool.query('SHOW COLUMNS FROM eventos');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('tipo_evento')) {
      await pool.query('ALTER TABLE eventos ADD COLUMN tipo_evento VARCHAR(50) AFTER slug');
      console.log('✅ Columna tipo_evento añadida');
    }
    
    if (!columnNames.includes('canton')) {
      await pool.query('ALTER TABLE eventos ADD COLUMN canton VARCHAR(100) AFTER provincia');
      console.log('✅ Columna canton añadida');
    }
    
    if (!columnNames.includes('distrito')) {
      await pool.query('ALTER TABLE eventos ADD COLUMN distrito VARCHAR(100) AFTER canton');
      console.log('✅ Columna distrito añadida');
    }
    
    console.log('--- Migración Finalizada ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrate();

