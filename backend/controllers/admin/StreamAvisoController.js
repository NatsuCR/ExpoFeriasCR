const fs = require('fs');
const path = require('path');
const pool = require('../../db');

const dataFilePath = path.join(__dirname, '../../data/stream_aviso.json');

class StreamAvisoController {
  // Helpers
  _readConfig() {
    try {
      if (!fs.existsSync(dataFilePath)) {
        return { activo: false, eventoId: null };
      }
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error al leer stream_aviso.json:', err);
      return { activo: false, eventoId: null };
    }
  }

  _writeConfig(config) {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(config, null, 2));
    } catch (err) {
      console.error('Error al escribir stream_aviso.json:', err);
    }
  }

  // Admin: Get current config
  getAdminConfig = (req, res) => {
    const config = this._readConfig();
    res.json(config);
  };

  // Admin: Update config
  updateAdminConfig = (req, res) => {
    const { activo, eventoId } = req.body;
    const config = {
      activo: Boolean(activo),
      eventoId: eventoId || null
    };
    this._writeConfig(config);
    res.json({ success: true, message: 'Configuración actualizada', config });
  };

  // Public: Get status and event details if active
  getPublicStatus = async (req, res) => {
    try {
      const config = this._readConfig();
      if (!config.activo || !config.eventoId) {
        return res.json({ activo: false });
      }

      const [rows] = await pool.query('SELECT id, nombre, imagen_portada FROM eventos WHERE id = ?', [config.eventoId]);
      if (rows.length === 0) {
        return res.json({ activo: false });
      }

      res.json({
        activo: true,
        evento: rows[0]
      });
    } catch (error) {
      console.error('Error en getPublicStatus:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  };
}

module.exports = new StreamAvisoController();
