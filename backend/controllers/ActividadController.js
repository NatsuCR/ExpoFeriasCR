const ActividadService = require('../services/ActividadService');

class ActividadController {
  constructor() {
    this.actividadService = new ActividadService();
  }

  async obtenerPorEvento(req, res) {
    try {
      const { slug } = req.params;
      const actividades = await this.actividadService.obtenerActividadesPorEventoSlug(slug);
      res.json(actividades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener actividades' });
    }
  }
}

module.exports = ActividadController;


