const pool = require('../backend/db');

async function reparar() {
  console.log('--- REPARACIÓN Y SINCRONIZACIÓN DE BASE DE DATOS (OPACIDAD) ---');
  try {
    const tables = [
      { name: 'usuarios', sql: "CREATE TABLE IF NOT EXISTS `usuarios` (`id` int(11) NOT NULL AUTO_INCREMENT, `nombre` varchar(100) NOT NULL, `email` varchar(100) NOT NULL, `password_hash` text NOT NULL, `rol` varchar(20) DEFAULT 'user', `activo` tinyint(1) DEFAULT 1, PRIMARY KEY (`id`), UNIQUE KEY `email` (`email`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" },
      { name: 'visitas', sql: "CREATE TABLE IF NOT EXISTS `visitas` (`id` int(11) NOT NULL AUTO_INCREMENT, `ip_address` varchar(45) NOT NULL, `page_url` varchar(255) NOT NULL, `visit_date` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" }
    ];
    for (const t of tables) {
      await pool.query(t.sql);
      console.log(`✅ Tabla "${t.name}" verificada.`);
    }
    const cols = [
      { name: 'color_hero_overlay', type: 'varchar(30) DEFAULT "0.7"' },
      { name: 'color_fondo_share', type: 'varchar(30) DEFAULT "0.5"' },
      { name: 'es_en_vivo', type: 'tinyint(4) DEFAULT 0' },
      { name: 'borrador_cambios', type: 'longtext DEFAULT NULL' }
    ];
    for (const c of cols) {
      try { await pool.query(`ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ${c.name} ${c.type}`); console.log(`✅ Columna "${c.name}" verificada.`); } catch(e) {}
    }
    console.log('--- FIN DEL PROCESO ---');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  }
}
reparar();
