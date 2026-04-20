const pool = require('../backend/db');

async function migrate() {
    try {
        console.log('Iniciando migración de tiene_expositores...');
        const [result] = await pool.query(
            "UPDATE eventos SET tiene_expositores = CASE WHEN tiene_expositores = 1 THEN 0 ELSE 1 END"
        );
        console.log(`Migración completada. Filas afectadas: ${result.affectedRows}`);
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
