document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatLoginPrompt = document.getElementById('chatLoginPrompt');

    // Token JWT del usuario
    const token = localStorage.getItem('token');
    
    // Conectar a Socket.io
    const socket = io({
        auth: {
            token: token
        }
    });

    let isAdmin = false;
    let currentUserData = null;

    // Verificar si el usuario está logueado para mostrar el input
    if (token) {
        chatLoginPrompt.style.display = 'none';
        chatForm.style.display = 'flex';
        
        // Decodificar JWT para saber si es admin (solo frontend, backend valida de todos modos)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserData = payload;
            if (payload.rol === 'admin') {
                isAdmin = true;
            }
        } catch (e) {
            console.error('Error parseando token', e);
        }
    }

    // Funciones del Chat
    const renderMessage = (msg, prepend = false) => {
        // No renderizar si está eliminado
        if (msg.eliminado === 1) return;

        const div = document.createElement('div');
        div.className = 'chat-message';
        div.id = `msg-${msg.id}`;
        div.dataset.userId = msg.usuario_id;
        
        if (msg.rol === 'admin') {
            div.classList.add('admin-msg');
        }

        let adminBadge = msg.rol === 'admin' ? '<span class="admin-badge">Admin</span>' : '';
        let actionsHtml = '';

        // Botones de Admin
        if (isAdmin && msg.rol !== 'admin') { // Admin puede borrar o banear a no-admins
            actionsHtml = `
                <div class="msg-actions">
                    <button onclick="deleteMessage(${msg.id})" title="Borrar mensaje"><i class="fas fa-trash"></i></button>
                    <button onclick="banUser(${msg.usuario_id})" title="Banear usuario"><i class="fas fa-ban"></i></button>
                </div>
            `;
        } else if (isAdmin && msg.rol === 'admin' && currentUserData.id !== msg.usuario_id) {
            // Un admin solo puede borrar mensajes de otros admins, pero no banearlos
             actionsHtml = `
                <div class="msg-actions">
                    <button onclick="deleteMessage(${msg.id})" title="Borrar mensaje"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }

        // Sanitizar el texto
        const p = document.createElement('span');
        p.textContent = msg.mensaje;

        div.innerHTML = `
            ${actionsHtml}
            <strong>${adminBadge}${escapeHtml(msg.nombre)}:</strong> 
            <span class="msg-content"></span>
        `;
        div.querySelector('.msg-content').textContent = msg.mensaje; // previene XSS

        if (prepend) {
            chatMessages.insertBefore(div, chatMessages.firstChild);
        } else {
            chatMessages.appendChild(div);
            scrollToBottom();
        }
    };

    // Escuchar historial de mensajes
    socket.on('load_messages', (messages) => {
        chatMessages.innerHTML = ''; // limpiar
        messages.forEach(msg => renderMessage(msg, false));
    });

    // Recibir nuevo mensaje
    socket.on('new_message', (msg) => {
        renderMessage(msg, false);
    });

    // Mensaje eliminado por admin
    socket.on('message_deleted', (msgId) => {
        const msgDiv = document.getElementById(`msg-${msgId}`);
        if (msgDiv) {
            msgDiv.classList.add('deleted-msg');
            msgDiv.innerHTML = '<em>Este mensaje ha sido eliminado por un administrador.</em>';
            // Remover acciones si las había
            const actions = msgDiv.querySelector('.msg-actions');
            if (actions) actions.remove();
        }
    });

    // Usuario baneado
    socket.on('user_banned', (userId) => {
        // Eliminar visualmente los mensajes del usuario baneado para todos
        const userMsgs = document.querySelectorAll(`.chat-message[data-user-id="${userId}"]`);
        userMsgs.forEach(msg => {
            msg.classList.add('deleted-msg');
            msg.innerHTML = '<em>Este mensaje ha sido eliminado por un administrador.</em>';
            const actions = msg.querySelector('.msg-actions');
            if (actions) actions.remove();
        });

        // Si el usuario baneado es el actual
        if (currentUserData && currentUserData.id === userId) {
            window.mostrarAlertaPremium('Acceso Restringido', 'Has sido baneado del chat y no podrás participar ni ver los mensajes.', 'Entendido', 'error');
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:#C8102E;"><h3>🚫 Baneado</h3><p>No tienes permiso para acceder al chat en vivo.</p></div>';
            }
            socket.disconnect();
        }
    });

    // Errores
    socket.on('chat_error', (errorMsg) => {
        window.mostrarAlertaPremium('Aviso', errorMsg, 'Entendido', 'warning');
        if (errorMsg === 'Estás baneado del chat.') {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.innerHTML = '<div style="padding:40px 20px; text-align:center; color:#C8102E;"><h3>🚫 Baneado</h3><p>No tienes permiso para acceder al chat en vivo.</p></div>';
            }
        }
    });

    // Enviar mensaje
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (text) {
            socket.emit('send_message', { mensaje: text });
            chatInput.value = '';
        }
    });

    // Funciones globales para botones
    window.deleteMessage = async function(msgId) {
        if (await window.confirmarAccion('Borrar Mensaje', '¿Estás seguro de borrar este mensaje?', 'danger')) {
            socket.emit('delete_message', msgId);
        }
    };

    window.banUser = async function(userId) {
        if (await window.confirmarAccion('Banear Usuario', '¿Estás seguro de banear a este usuario? No podrá comentar más en el chat en vivo.', 'danger')) {
            socket.emit('ban_user', userId);
        }
    };

    // Utilidades
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
