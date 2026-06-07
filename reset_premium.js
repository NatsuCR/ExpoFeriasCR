const pool = require('./backend/db');

async function resetPremium() {
    try {
        console.log("Iniciando reseteo de usuarios premium...");
        
        // Set all users premium_hasta to NULL
        const [resultUsuarios] = await pool.query('UPDATE usuarios SET premium_hasta = NULL');
        console.log(`✅ Usuarios actualizados (premium removido): ${resultUsuarios.affectedRows}`);
        
        console.log("¡Reseteo completado!");
    } catch (err) {
        console.error("❌ Error durante el reseteo:", err);
    } finally {
        process.exit();
    }
}

resetPremium();
