const PrecioService = require('../services/PrecioService');

class PrecioController {
  constructor() {
    this.precioService = new PrecioService();
  }

  async obtenerPorEvento(req, res) {
    try {
      const { slug } = req.params;
      const precios = await this.precioService.obtenerPreciosPorEventoSlug(slug);
      res.json(precios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener precios' });
    }
  }
}

module.exports = PrecioController;


