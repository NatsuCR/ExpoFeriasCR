const pool = require('./db');

async function init() {
  try {
    console.log('Creando tabla evento_compartir...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS evento_compartir (
        id INT AUTO_INCREMENT PRIMARY KEY,
        evento_id INT NOT NULL,
        color_fondo_share VARCHAR(30) DEFAULT 'rgba(255, 255, 255, 0.5)',
        UNIQUE KEY unique_evento (evento_id),
        FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabla creada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error creando tabla:', error);
    process.exit(1);
  }
}

init();



