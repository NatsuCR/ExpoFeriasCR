const pool = require('../backend/db');

async function reparar() {
  console.log('--- REPARACIÓN Y SINCRONIZACIÓN DE BASE DE DATOS (V2) ---');
  try {
    // 1. Verificar/Crear Tablas
    const tables = [
      { 
        name: 'usuarios', 
        sql: "CREATE TABLE IF NOT EXISTS `usuarios` (`id` int(11) NOT NULL AUTO_INCREMENT, `nombre` varchar(100) NOT NULL, `email` varchar(100) NOT NULL, `password_hash` text NOT NULL, `rol` varchar(20) DEFAULT 'user', `activo` tinyint(1) DEFAULT 1, `created_at` timestamp DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `email` (`email`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 
      },
      { 
        name: 'visitas', 
        sql: "CREATE TABLE IF NOT EXISTS `visitas` (`id` int(11) NOT NULL AUTO_INCREMENT, `ip_address` varchar(45) NOT NULL, `page_url` varchar(255) NOT NULL, `visit_date` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 
      }
    ];

    for (const t of tables) {
      await pool.query(t.sql);
      console.log(`✅ Tabla "${t.name}" verificada.`);
    }

    // 2. Sincronizar Columnas faltantes en Eventos
    const eventCols = [
      { name: 'color_hero_overlay', type: 'varchar(30) DEFAULT "0.7"' },
      { name: 'color_fondo_share', type: 'varchar(30) DEFAULT "0.5"' },
      { name: 'color_texto_share', type: 'varchar(30) DEFAULT "#2c1a0e"' },
      { name: 'es_en_vivo', type: 'tinyint(4) DEFAULT 0' },
      { name: 'url_en_vivo', type: 'text DEFAULT NULL' },
      { name: 'borrador_cambios', type: 'longtext DEFAULT NULL' }
    ];

    for (const c of eventCols) {
      try {
        await pool.query(`ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ${c.name} ${c.type}`);
        // Forzar tipo correcto si ya existía con otro nombre/formato
        await pool.query(`ALTER TABLE eventos MODIFY COLUMN ${c.name} ${c.type}`);
        console.log(`✅ Columna Eventos: "${c.name}" sincronizada.`);
      } catch(e) { console.log(`ℹ️ Columna Eventos "${c.name}" ya configurada.`); }
    }

    // 3. Sincronizar Columnas faltantes en Usuarios (Asegurar created_at)
    try {
      await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP`);
      console.log(`✅ Columna Usuarios: "created_at" verificada.`);
    } catch(e) { console.log(`ℹ️ Columna Usuarios "created_at" ya configurada.`); }

    console.log('--- TODO LISTO ---');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  }
}
reparar();
