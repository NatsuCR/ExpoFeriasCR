const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '../index.html';
} else {
    const listaBaneados = document.getElementById('listaBaneados');

    async function cargarBaneados() {
        try {
            const res = await fetch('/api/admin/chat-bans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                window.location.href = '../index.html';
                return;
            }

            const baneados = await res.json();
            
            if (baneados.length === 0) {
                if (listaBaneados) listaBaneados.innerHTML = `<tr><td colspan="5" class="empty-state">No hay usuarios baneados.</td></tr>`;
                return;
            }

            if (listaBaneados) listaBaneados.innerHTML = '';
            baneados.forEach(ban => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${ban.usuario_id}</td>
                    <td>${ban.nombre}</td>
                    <td>${ban.email}</td>
                    <td>${window.formatDateCR ? window.formatDateCR(ban.fecha_ban) : new Date(ban.fecha_ban).toLocaleString()}</td>
                    <td>
                        <button class="btn-desbanear" onclick="desbanear(${ban.usuario_id})">
                            <i class="fas fa-undo"></i> Desbanear
                        </button>
                    </td>
                `;
                if (listaBaneados) listaBaneados.appendChild(tr);
            });
        } catch (error) {
            console.error('Error cargando baneados:', error);
            if (listaBaneados) listaBaneados.innerHTML = `<tr><td colspan="5" class="empty-state">Error cargando la lista.</td></tr>`;
        }
    }

    window.desbanear = async function(userId) {
        if (await window.confirmarAccion('Desbanear Usuario', '¿Estás seguro que deseas quitarle el baneo a este usuario?', 'success')) {
            try {
                const res = await fetch(`/api/admin/chat-bans/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    window.mostrarAlertaPremium('¡Usuario Desbaneado!', 'El usuario ya puede volver a comentar en el chat.', 'Entendido', 'success');
                    cargarBaneados();
                } else {
                    window.mostrarAlertaPremium('Error', 'No se pudo desbanear al usuario.', 'Cerrar', 'error');
                }
            } catch (error) {
                console.error(error);
                window.mostrarAlertaPremium('Error', 'Hubo un error de conexión.', 'Cerrar', 'error');
            }
        }
    };

    cargarBaneados();
}
