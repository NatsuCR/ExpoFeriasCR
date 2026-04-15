const pool = require('../backend/db');

async function migrate() {
    try {
        console.log('Running migration...');
        await pool.query("ALTER TABLE eventos ADD COLUMN color_borde_buscador_expositores VARCHAR(20) DEFAULT '#eee';");
        console.log('Migration successful: color_borde_buscador_expositores added.');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
