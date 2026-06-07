const pool = require('../backend/db');

async function runMigration() {
    try {
        console.log("Ejecutando migración: agregando premium_hasta a usuarios...");
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN premium_hasta DATETIME NULL DEFAULT NULL;
        `);
        console.log("Columna agregada exitosamente.");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("La columna premium_hasta ya existe.");
        } else {
            console.error("Error al ejecutar migración:", error);
        }
    } finally {
        process.exit();
    }
}

runMigration();
