const EventoService = require('../services/EventoService');

class EventoController {
  constructor() {
    this.eventoService = new EventoService();
  }

  async obtenerTodos(req, res) {
    try {
      const eventos = await this.eventoService.obtenerEventosActivos();
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  async obtenerPorSlug(req, res) {
    try {
      const { slug } = req.params;
      const evento = await this.eventoService.obtenerEventoPorSlug(slug);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      res.json(evento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el evento' });
    }
  }
}

module.exports = EventoController;