const GaleriaService = require('../../services/GaleriaService');

class GaleriaController {
  constructor() {
    this.galeriaService = new GaleriaService();
  }

  async obtenerPorEvento(req, res) {
    try {
      const { slug } = req.params;
      const imagenes = await this.galeriaService.obtenerGaleriaPorEventoSlug(slug);
      res.json(imagenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener galería' });
    }
  }
}

module.exports = GaleriaController;