const pool = require('../backend/db');

async function sync() {
  console.log('--- SINCRONIZACIÓN DE EMERGENCIA (LIMPIEZA DE ERRORES 500) ---');
  try {
    // 1. Tablas Requeridas por el Sistema
    const tables = [
      { 
        name: 'usuarios', 
        sql: "CREATE TABLE IF NOT EXISTS `usuarios` (`id` int(11) NOT NULL AUTO_INCREMENT, `nombre` varchar(100) NOT NULL, `email` varchar(100) NOT NULL, `password_hash` text NOT NULL, `rol` varchar(20) DEFAULT 'admin', `activo` tinyint(1) DEFAULT 1, `created_at` timestamp DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), UNIQUE KEY `email` (`email`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 
      },
      { 
        name: 'visitas', 
        sql: "CREATE TABLE IF NOT EXISTS `visitas` (`id` int(11) NOT NULL AUTO_INCREMENT, `ip_address` varchar(45) NOT NULL, `page_url` varchar(255) NOT NULL, `visit_date` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;" 
      },
      {
        name: 'actividades',
        sql: "CREATE TABLE IF NOT EXISTS `actividades` (`id` int(11) NOT NULL AUTO_INCREMENT, `evento_id` int(11) NOT NULL, `titulo` varchar(200) NOT NULL, `tipo` varchar(50) DEFAULT NULL, `descripcion` text DEFAULT NULL, `fecha` date DEFAULT NULL, `hora` time DEFAULT NULL, `lugar` varchar(200) DEFAULT NULL, `es_gratis` tinyint(1) DEFAULT 0, `imagen` text DEFAULT NULL, `requiere_entrada_online` tinyint(1) DEFAULT 0, `enlace_venta` text DEFAULT NULL, PRIMARY KEY (`id`), KEY `idx_evento` (`evento_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
      },
      {
        name: 'expositores',
        sql: "CREATE TABLE IF NOT EXISTS `expositores` (`id` int(11) NOT NULL AUTO_INCREMENT, `evento_id` int(11) NOT NULL, `nombre` varchar(200) NOT NULL, `tipo_expositor` varchar(50) DEFAULT 'Administración', `descripcion` text DEFAULT NULL, `ubicacion` varchar(200) DEFAULT NULL, `imagen_logo` text DEFAULT NULL, `video_url` text DEFAULT NULL, PRIMARY KEY (`id`), KEY `idx_evento` (`evento_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
      },
      {
        name: 'precios_entrada',
        sql: "CREATE TABLE IF NOT EXISTS `precios_entrada` (`id` int(11) NOT NULL AUTO_INCREMENT, `evento_id` int(11) NOT NULL, `fecha` date NOT NULL, `precio_normal` decimal(10,2) NOT NULL, `promocion` varchar(50) DEFAULT NULL, `descripcion_promocion` text DEFAULT NULL, PRIMARY KEY (`id`), KEY `idx_evento` (`evento_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
      },
      {
        name: 'evento_galeria',
        sql: "CREATE TABLE IF NOT EXISTS `evento_galeria` (`id` int(11) NOT NULL AUTO_INCREMENT, `evento_id` int(11) NOT NULL, `imagen_url` text NOT NULL, PRIMARY KEY (`id`), KEY `idx_evento` (`evento_id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
      }
    ];

    for (const t of tables) {
      await pool.query(t.sql);
      console.log(`✅ Tabla "${t.name}" verificada.`);
    }

    // 2. Sincronización de Columnas Críticas en Eventos (Opacidad y Estilos)
    const eventCols = [
      { name: 'color_hero_overlay', type: 'varchar(30) DEFAULT "0.7"' },
      { name: 'color_fondo_share', type: 'varchar(30) DEFAULT "0.5"' },
      { name: 'color_texto_share', type: 'varchar(20) DEFAULT "#2c1a0e"' },
      { name: 'updated_at', type: 'timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const c of eventCols) {
      try {
        await pool.query(`ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ${c.name} ${c.type}`);
        // Forzar tipo correcto si ya existía (ej. para cambiar de RGBA a número)
        if (c.name.includes('color_')) {
            await pool.query(`ALTER TABLE eventos MODIFY COLUMN ${c.name} ${c.type}`);
        }
        console.log(`✅ Columna Eventos: "${c.name}" sincronizada.`);
      } catch(e) { console.log(`ℹ️ Columna Eventos "${c.name}" ya configurada.`); }
    }

    // 3. Arreglo Crítico para Usuarios (created_at)
    try {
      await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP`);
      console.log(`✅ Columna Usuarios: "created_at" verificada.`);
    } catch(e) { console.log(`ℹ️ Columna Usuarios "created_at" ya configurada.`); }

    console.log('--- REPARACIÓN COMPLETADA ---');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error fatal durante la sincronización:', e.message);
    process.exit(1);
  }
}
sync();

