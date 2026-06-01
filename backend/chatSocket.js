const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db');

module.exports = function (server) {
  const io = socketIo(server, {
    cors: {
      origin: '*', // En producción, deberías restringir esto a tu dominio
      methods: ['GET', 'POST']
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.user = null; // Usuario anónimo (solo puede leer)
      return next();
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        socket.user = null;
      } else {
        socket.user = decoded; // Contiene id, email, rol
      }
      next();
    });
  });

  // Mantenimiento automático: Eliminar mensajes con más de 24 horas de antigüedad.
  // La revisión se ejecuta cada hora (1000 * 60 * 60 ms).
  setInterval(async () => {
    try {
      const [result] = await pool.query('DELETE FROM chat_messages WHERE fecha < (NOW() - INTERVAL 24 HOUR)');
      if (result.affectedRows > 0) {
        console.log(`[MANTENIMIENTO CHAT] Memoria liberada. Se borraron ${result.affectedRows} mensajes con más de 24 horas de antigüedad.`);
      }
    } catch (error) {
      console.error('[MANTENIMIENTO CHAT] Error al intentar limpiar mensajes antiguos:', error);
    }
  }, 1000 * 60 * 60);

  io.on('connection', async (socket) => {
    // 1. Verificar si el usuario está baneado
    if (socket.user) {
      try {
        const [bans] = await pool.query('SELECT id FROM chat_bans WHERE usuario_id = ?', [socket.user.id]);
        if (bans.length > 0) {
          socket.user.isBanned = true;
          socket.emit('user_banned', socket.user.id); // Avisarle al cliente inmediatamente
        } else {
          socket.user.isBanned = false;
        }
      } catch (e) {
        console.error('[CHAT] Error verificando ban:', e);
      }
    }

    // 2. Unirse a la sala del streaming
    socket.join('streaming_room');

    // 3. Cargar últimos mensajes (historial)
    try {
      const [messages] = await pool.query(`
        SELECT m.id, m.usuario_id, m.mensaje, m.fecha, m.eliminado, u.nombre, u.rol
        FROM chat_messages m
        JOIN usuarios u ON m.usuario_id = u.id
        ORDER BY m.fecha DESC LIMIT 100
      `);
      // Enviar historial al cliente recién conectado (el orden se invierte para que los más viejos salgan arriba)
      socket.emit('load_messages', messages.reverse());
    } catch (e) {
      console.error('[CHAT] Error cargando mensajes:', e);
    }

    // 4. Recibir y guardar un mensaje nuevo
    socket.on('send_message', async (data) => {
      if (!socket.user) return socket.emit('chat_error', 'Debes iniciar sesión para comentar.');
      if (socket.user.isBanned) return socket.emit('chat_error', 'Estás baneado del chat.');

      const text = data.mensaje;
      if (!text || text.trim() === '') return;

      try {
        const [result] = await pool.query(
          'INSERT INTO chat_messages (usuario_id, mensaje) VALUES (?, ?)',
          [socket.user.id, text.trim()]
        );
        
        // Obtener nombre del usuario (ya que no viene en el token JWT)
        const [users] = await pool.query('SELECT nombre FROM usuarios WHERE id = ?', [socket.user.id]);
        let nombre = 'Usuario';
        if (users.length > 0) nombre = users[0].nombre;

        const newMsg = {
          id: result.insertId,
          usuario_id: socket.user.id,
          mensaje: text.trim(),
          fecha: new Date(),
          eliminado: 0,
          nombre: nombre,
          rol: socket.user.rol
        };

        // Emitir a todos los conectados
        io.to('streaming_room').emit('new_message', newMsg);
      } catch (e) {
        console.error('[CHAT] Error guardando mensaje:', e);
      }
    });

    // 5. Borrar mensaje (Solo Administradores)
    socket.on('delete_message', async (messageId) => {
      if (!socket.user || socket.user.rol !== 'admin') return;

      try {
        await pool.query('UPDATE chat_messages SET eliminado = 1 WHERE id = ?', [messageId]);
        io.to('streaming_room').emit('message_deleted', messageId);
      } catch (e) {
        console.error('[CHAT] Error borrando mensaje:', e);
      }
    });

    // 6. Banear usuario (Solo Administradores)
    socket.on('ban_user', async (usuarioIdToBan) => {
      if (!socket.user || socket.user.rol !== 'admin') return;

      try {
        // Verificar si ya está baneado
        const [bans] = await pool.query('SELECT id FROM chat_bans WHERE usuario_id = ?', [usuarioIdToBan]);
        if (bans.length === 0) {
          await pool.query('INSERT INTO chat_bans (usuario_id, admin_id) VALUES (?, ?)', [usuarioIdToBan, socket.user.id]);
        }
        
        // También borrar todos los mensajes de este usuario para que no aparezcan en el historial
        await pool.query('UPDATE chat_messages SET eliminado = 1 WHERE usuario_id = ?', [usuarioIdToBan]);

        io.to('streaming_room').emit('user_banned', usuarioIdToBan);
      } catch (e) {
        console.error('[CHAT] Error baneando usuario:', e);
      }
    });
  });
};
