const ExpositorService = require('../../services/ExpositorService');

class ExpositorController {
  constructor() {
    this.expositorService = new ExpositorService();
  }

  async obtenerPorEvento(req, res) {
    try {
      const { slug } = req.params;
      const expositores = await this.expositorService.obtenerExpositoresPorEventoSlug(slug);
      res.json(expositores);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener expositores' });
    }
  }
}

module.exports = ExpositorController;