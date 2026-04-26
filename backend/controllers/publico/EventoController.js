const EventoService = require('../../services/EventoService');

class EventoController {
  constructor() {
    this.eventoService = new EventoService();
  }

  // Próximos eventos
  async obtenerTodos(req, res) {
    try {
      const { provincia } = req.query;
      const eventos = await this.eventoService.obtenerEventosActivos(provincia || null);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  // Eventos de hoy
  async obtenerHoy(req, res) {
    try {
      const { provincia } = req.query;
      const eventos = await this.eventoService.obtenerEventosHoy(provincia || null);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos de hoy' });
    }
  }

  // Eventos en progreso (en vivo)
  async obtenerEnProgreso(req, res) {
    try {
      const { provincia } = req.query;
      const eventos = await this.eventoService.obtenerEventosEnProgreso(provincia || null);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos en progreso' });
    }
  }

  // TODOS los eventos activos (para búsqueda)
  async obtenerTodosActivos(req, res) {
    try {
      const { provincia } = req.query;
      const eventos = await this.eventoService.obtenerTodosActivos(provincia || null);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener todos los eventos' });
    }
  }

  // Eventos finalizados
  async obtenerFinalizados(req, res) {
    try {
      const { provincia } = req.query;
      const eventos = await this.eventoService.obtenerEventosFinalizados(provincia || null);
      res.json(eventos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener eventos finalizados' });
    }
  }

  async obtenerPorSlug(req, res) {
    try {
      const { slug } = req.params;
      const evento = await this.eventoService.obtenerEventoPorSlug(slug);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el evento' });
    }
  }
}

module.exports = EventoController;


