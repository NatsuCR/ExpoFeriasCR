const pool = require('../../db');

class ChatBansController {
    // Listar todos los baneados con información del usuario
    async listar(req, res) {
        try {
            const query = `
                SELECT cb.id as ban_id, cb.fecha as fecha_ban, 
                       u.id as usuario_id, u.nombre, u.email
                FROM chat_bans cb
                JOIN usuarios u ON cb.usuario_id = u.id
                ORDER BY cb.fecha DESC
            `;
            const [rows] = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error('Error al listar baneados:', error);
            res.status(500).json({ message: 'Error interno del servidor al cargar baneados.' });
        }
    }

    // Eliminar un ban (Desbanear)
    async desbanear(req, res) {
        try {
            const userId = req.params.userId;
            const query = 'DELETE FROM chat_bans WHERE usuario_id = ?';
            const [result] = await pool.query(query, [userId]);
            
            if (result.affectedRows > 0) {
                res.json({ message: 'Usuario desbaneado exitosamente.' });
            } else {
                res.status(404).json({ message: 'No se encontró un ban para este usuario.' });
            }
        } catch (error) {
            console.error('Error al desbanear usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor al desbanear.' });
        }
    }
}

module.exports = new ChatBansController();
