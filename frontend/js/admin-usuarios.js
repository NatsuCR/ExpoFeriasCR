// admin-usuarios.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let usuariosGlobal = [];

const btnCrearUsuario = document.getElementById('btnCrearUsuario');
const btnEliminarSeleccionados = document.getElementById('btnEliminarSeleccionados');
const listaUsuariosDiv = document.getElementById('listaUsuarios');
const globalMessage = document.getElementById('globalMessage');

async function fetchAPI(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
    return res.json();
}

function mostrarMensaje(texto, tipo) {
    globalMessage.className = `message message-${tipo}`;
    globalMessage.innerText = texto;
    globalMessage.style.display = 'block';
    setTimeout(() => {
        globalMessage.style.display = 'none';
    }, 4000);
}

async function cargarUsuarios() {
    const usuarios = await fetchAPI('/api/admin/usuarios');
    usuariosGlobal = usuarios;
    
    const divAdmins = document.getElementById('listaAdmins');
    const divRegulares = document.getElementById('listaRegulares');

    if (usuarios.length === 0) {
        if(divAdmins) divAdmins.innerHTML = '<p>No hay usuarios registrados.</p>';
        if(divRegulares) divRegulares.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
    }

    const admins = usuarios.filter(u => u.rol === 'admin');
    const regulares = usuarios.filter(u => u.rol !== 'admin');

    const generateTable = (usersList) => {
        if (usersList.length === 0) return '<p>No hay usuarios en esta categoría.</p>';
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="checkbox-col"><input type="checkbox" class="selectAllCheckbox"></th>
                        <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th>
                    </tr>
                </thead>
                <tbody>
        `;
        usersList.forEach(u => {
            html += `
                <tr data-id="${u.id}">
                    <td class="checkbox-col"><input type="checkbox" class="user-check" data-id="${u.id}"></td>
                    <td>${u.id}</td>
                    <td>${escapeHtml(u.nombre)}</td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>${u.rol}</td>
                    <td>${u.activo ? 'Sí' : 'No'}</td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        return html;
    };

    if(divAdmins) divAdmins.innerHTML = generateTable(admins);
    if(divRegulares) divRegulares.innerHTML = generateTable(regulares);

    // Evento para "Seleccionar todos"
    document.querySelectorAll('.selectAllCheckbox').forEach(selectAll => {
        selectAll.addEventListener('change', (e) => {
            const table = e.target.closest('table');
            if(table) {
                table.querySelectorAll('.user-check').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            }
            actualizarBotonEliminar();
        });
    });

    // Evento para cada checkbox individual
    document.querySelectorAll('.user-check').forEach(cb => {
        cb.addEventListener('change', actualizarBotonEliminar);
    });

    actualizarBotonEliminar();
}

function actualizarBotonEliminar() {
    const checkboxes = document.querySelectorAll('.user-check:checked');
    btnEliminarSeleccionados.disabled = checkboxes.length === 0;
}

async function eliminarUsuariosSeleccionados() {
    const checkboxes = document.querySelectorAll('.user-check:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
    if (ids.length === 0) return;
    const confirmar = confirm(`¿Eliminar ${ids.length} usuario(s) seleccionados? Esta acción es irreversible.`);
    if (!confirmar) return;
    for (const id of ids) {
        await fetchAPI(`/api/admin/usuarios/${id}`, { method: 'DELETE' });
    }
    mostrarMensaje(`${ids.length} usuario(s) eliminado(s)`, 'success');
    cargarUsuarios(); // Recargar la lista
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

btnCrearUsuario.addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!nombre || !email || !password) {
        mostrarMensaje('Todos los campos son obligatorios', 'error');
        return;
    }
    try {
        const result = await fetchAPI('/api/admin/usuarios', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password, rol: 'admin' })
        });
        if (result.error) {
            mostrarMensaje(result.error, 'error');
        } else {
            mostrarMensaje(`Usuario ${result.email} creado correctamente`, 'success');
            document.getElementById('nombre').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            cargarUsuarios();
        }
    } catch (err) {
        mostrarMensaje('Error al crear usuario', 'error');
    }
});

btnEliminarSeleccionados.addEventListener('click', eliminarUsuariosSeleccionados);

cargarUsuarios();


