// admin-dashboard.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let eventosGlobal = [];

// Elementos del DOM
let btnLogout                 = document.getElementById('btnLogout');
let btnCrearEvento            = document.getElementById('btnCrearEvento');
let btnEliminarSeleccionados  = document.getElementById('btnEliminarSeleccionados');
let btnEliminarPorFecha       = document.getElementById('btnEliminarPorFecha');
let listaEventosDiv           = document.getElementById('listaEventos');

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function formatFecha(isoStr) {
    return new Date(isoStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function estadoEvento(e) {
    // Primero verificar estado de aprobación
    if (e.estado === 'pendiente')           return { label: 'Pendiente', cls: 'estado-pendiente' };
    if (e.estado === 'edicion_pendiente')   return { label: 'Edición pendiente', cls: 'estado-edicion-pendiente' };
    if (e.estado === 'rechazado')           return { label: 'Rechazado', cls: 'estado-rechazado' };
    if (e.estado !== 'aprobado')            return { label: 'Sin aprobar', cls: 'estado-no-aprobado' };
    
    // Si está aprobado, mostrar estado por fechas
    const hoy = new Date();
    // Normalizar hoy a las 00:00:00 para comparaciones de solo fecha si fuera necesario, 
    // pero aquí compararemos contra el final del día de 'fin'
    const ini = new Date(e.fecha_inicio);
    const fin = new Date(e.fecha_fin);
    
    // Seteamos 'fin' al último milisegundo del día para que "Hoy" siga siendo "En curso"
    const finDelDia = new Date(fin);
    finDelDia.setHours(23, 59, 59, 999);

    if (hoy >= ini && hoy <= finDelDia) return { label: 'En curso ✓', cls: 'estado-activo' };
    if (hoy < ini)                      return { label: 'Próximo ✓',  cls: 'estado-proximo' };
    return                                     { label: 'Finalizado ✓', cls: 'estado-pasado' };
}

// ── Secciones de resumen ──────────────────────────────────────────────────────

function renderRecientes(eventos) {
    const contenedor = document.getElementById('listaRecientes');
    const badge      = document.getElementById('badgeRecientes');

    // Filtrar eventos que NO estén pendientes y que NO estén finalizados, luego ordenar por id desc y tomar 5
    const recientes = eventos
        .filter(e => e.estado !== 'pendiente' && e.estado !== 'edicion_pendiente' && estadoEvento(e).cls !== 'estado-pasado')
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    badge.textContent = recientes.length;

    if (recientes.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">Sin eventos registrados.</p>';
        return;
    }

    contenedor.innerHTML = recientes.map(e => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="reciente-dot"></div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Editar</button>
        </div>`;
    }).join('');
}

function renderPendientes(eventos) {
    const contenedor = document.getElementById('listaPendientes');
    const badge      = document.getElementById('badgePendientes');

    // Filtrar solo los eventos que están pendientes de revisión o edición
    const pendientes = eventos.filter(e => e.estado === 'pendiente' || e.estado === 'edicion_pendiente');

    // Ordenar por id desc (los más recientes primero)
    const ordenados = [...pendientes].sort((a, b) => b.id - a.id);

    badge.textContent = ordenados.length;

    if (ordenados.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">No hay eventos pendientes de revisión.</p>';
        return;
    }

    contenedor.innerHTML = ordenados.map(e => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="reciente-dot" style="background:#f39c12;"></div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Revisar</button>
        </div>`;
    }).join('');
}

function renderCronologico(eventos) {
    const contenedor = document.getElementById('listaCronologico');
    const badge      = document.getElementById('badgeCronologico');

    // Filtrar eventos aprobados y no finalizados
    const activos = eventos.filter(e => e.estado === 'aprobado' && estadoEvento(e).cls !== 'estado-pasado');

    // Ordenar por fecha_inicio asc; si empatan, por fecha_fin asc
    const ordenados = [...activos].sort((a, b) => {
        const diffIni = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
        if (diffIni !== 0) return diffIni;
        return new Date(a.fecha_fin) - new Date(b.fecha_fin);
    });

    badge.textContent = ordenados.length;

    if (ordenados.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">Sin eventos activos registrados.</p>';
        return;
    }

    contenedor.innerHTML = ordenados.map((e, i) => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="orden-badge">${i + 1}</div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Editar</button>
        </div>`;
    }).join('');
}

function renderFinalizados(eventos) {
    const contenedor = document.getElementById('listaFinalizados');
    const badge      = document.getElementById('badgeFinalizados');

    // Filtrar solo eventos finalizados
    const finalizados = eventos.filter(e => estadoEvento(e).cls === 'estado-pasado');

    // Ordenar por fecha_inicio asc; si empatan, por fecha_fin asc
    const ordenados = [...finalizados].sort((a, b) => {
        const diffIni = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
        if (diffIni !== 0) return diffIni;
        return new Date(a.fecha_fin) - new Date(b.fecha_fin);
    });

    badge.textContent = ordenados.length;

    if (ordenados.length === 0) {
        contenedor.innerHTML = '<p class="section-empty">No hay eventos finalizados.</p>';
        return;
    }

    contenedor.innerHTML = ordenados.map((e, i) => {
        const estado = estadoEvento(e);
        return `
        <div class="mini-evento">
            <div class="orden-badge" style="background:#7f8c8d;">${i + 1}</div>
            <div class="mini-evento-info">
                <strong title="${escapeHtml(e.nombre)}">${escapeHtml(e.nombre)}
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                </strong>
                <span>${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}</span>
            </div>
            <button class="mini-edit-btn" onclick="editarEvento(${e.id})">Editar</button>
        </div>`;
    }).join('');
}

// ── Lista completa ────────────────────────────────────────────────────────────

async function cargarEventos() {
    const eventos = await fetchAPI('/api/admin/eventos');
    eventosGlobal = eventos;

    // Render de secciones de resumen
    renderRecientes(eventos);
    renderPendientes(eventos);
    renderCronologico(eventos);
    renderFinalizados(eventos);

    // Render de lista completa
    if (eventos.length === 0) {
        listaEventosDiv.innerHTML = '<p>No hay eventos registrados.</p>';
        return;
    }

    let html = '';
    eventos.forEach(e => {
        const estado = estadoEvento(e);
        html += `
        <div class="evento-item" data-id="${e.id}">
            <div class="evento-info">
                <input type="checkbox" class="evento-check" data-id="${e.id}">
                <div class="evento-details">
                    <strong>${escapeHtml(e.nombre)}</strong>
                    <span class="estado-tag ${estado.cls}">${estado.label}</span>
                    <small style="color:#999"> (${e.slug})</small><br>
                    ${formatFecha(e.fecha_inicio)} → ${formatFecha(e.fecha_fin)}<br>
                    ${escapeHtml(e.ubicacion)}
                </div>
            </div>
            <div class="evento-actions">
                <button class="btn btn-warning btn-editar" data-id="${e.id}">Editar</button>
                <button class="btn btn-danger btn-eliminar" data-id="${e.id}">Eliminar</button>
            </div>
        </div>`;
    });
    listaEventosDiv.innerHTML = html;

    document.querySelectorAll('.evento-check').forEach(cb =>
        cb.addEventListener('change', actualizarBotonEliminarSeleccionados)
    );
    document.querySelectorAll('.btn-editar').forEach(btn =>
        btn.addEventListener('click', () => editarEvento(btn.dataset.id))
    );
    document.querySelectorAll('.btn-eliminar').forEach(btn =>
        btn.addEventListener('click', () => eliminarEvento(btn.dataset.id))
    );
    actualizarBotonEliminarSeleccionados();
}

// ── Acciones ─────────────────────────────────────────────────────────────────

function actualizarBotonEliminarSeleccionados() {
    const total = document.querySelectorAll('.evento-check');
    const checks = document.querySelectorAll('.evento-check:checked');
    btnEliminarSeleccionados.disabled = checks.length === 0;

    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.checked = total.length > 0 && total.length === checks.length;
    }
}

async function eliminarEvento(id) {
    const confirmado = await window.confirmarAccion('¿Eliminar evento?', 'Se borrarán también precios, actividades, expositores y galería. Esta acción es irreversible.');
    if (confirmado) {
        await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        cargarEventos();
    }
}

async function eliminarSeleccionados() {
    const checks = document.querySelectorAll('.evento-check:checked');
    const ids = Array.from(checks).map(cb => cb.dataset.id);
    if (ids.length === 0) return;
    
    const confirmado = await window.confirmarAccion('¿Eliminar seleccionados?', `Se eliminarán permanentemente ${ids.length} evento(s).`);
    if (confirmado) {
        for (const id of ids) await fetchAPI(`/api/admin/eventos/${id}`, { method: 'DELETE' });
        cargarEventos();
    }
}

async function eliminarPorFecha() {
    const fechaInicio = document.getElementById('fecha_inicio_eliminar').value;
    const fechaFin    = document.getElementById('fecha_fin_eliminar').value;
    if (!fechaInicio || !fechaFin) { alert('Seleccione ambas fechas.'); return; }

    const eventosAEliminar = eventosGlobal.filter(e => {
        const ini = new Date(e.fecha_inicio);
        const fin = new Date(e.fecha_fin);
        return ini >= new Date(fechaInicio) && fin <= new Date(fechaFin);
    });

    if (eventosAEliminar.length === 0) { alert('No hay eventos en ese rango de fechas.'); return; }
    
    const confirmado = await window.confirmarAccion('¿Eliminar rango?', `Se eliminarán permanentemente ${eventosAEliminar.length} evento(s) en este rango de fechas.`);
    if (!confirmado) return;

    for (const e of eventosAEliminar)
        await fetchAPI(`/api/admin/eventos/${e.id}`, { method: 'DELETE' });

    cargarEventos();
    document.getElementById('fecha_inicio_eliminar').value = '';
    document.getElementById('fecha_fin_eliminar').value    = '';
}

function editarEvento(id) {
    window.location.href = `evento-form.html?id=${id}`;
}

// ── Event listeners ───────────────────────────────────────────────────────────

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
});
btnCrearEvento.addEventListener('click', () => { window.location.href = 'evento-form.html'; });
btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
btnEliminarPorFecha.addEventListener('click', eliminarPorFecha);

// Lógica de Seleccionar Todos
document.getElementById('selectAll')?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.querySelectorAll('.evento-check').forEach(cb => {
        cb.checked = isChecked;
    });
    actualizarBotonEliminarSeleccionados();
});

// Lógica de Búsqueda
document.getElementById('buscadorEventos')?.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.evento-item');
    items.forEach(item => {
        const details = item.querySelector('.evento-details');
        if (details && details.textContent.toLowerCase().includes(texto)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// Helper para mostrar toast
function mostrarToast(mensaje, tipo = 'success') {
    let toast = document.getElementById('toast-mensaje');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-mensaje';
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.className = `toast-mensaje ${tipo}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Fallback for common.js mostrarMensaje
window.mostrarMensaje = function(texto, tipo, contenedorId = 'globalMessage') {
    const div = document.getElementById(contenedorId);
    if (div) {
        div.className = `message message-${tipo}`;
        div.innerText = texto;
        div.style.display = 'block';
        setTimeout(() => { div.style.display = 'none'; }, 4000);
    } else {
        mostrarToast(texto, tipo);
    }
};

window.editarEvento = editarEvento;

cargarEventos();

// ── Mobile Menu Toggle ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('adminMenuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
});

// ── SPA Router ────────────────────────────────────────────────────────────────
function loadPageSPA(url) {
    const wrapper = document.querySelector('.content-wrapper');
    wrapper.innerHTML = '<div style="padding:40px; text-align:center; color:#888;">Cargando...</div>';
    
    fetch(url)
        .then(res => res.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            let content = '';

            if (url.includes('dashboard.html')) {
                const cw = doc.querySelector('.content-wrapper');
                if (cw) content = cw.innerHTML;
            } else if (url.includes('eventos-pendientes.html')) {
                const cw = doc.querySelector('.admin-eventos-container');
                if (cw) {
                    content = cw.outerHTML;
                    doc.querySelectorAll('.modal-overlay').forEach(m => content += m.outerHTML);
                }
            } else if (url.includes('usuarios.html') || url.includes('usuarios-premium.html') || url.includes('baneados.html') || url.includes('stats.html')) {
                const cw = doc.querySelector('.admin-container');
                if (cw) {
                    const btnVolver = cw.querySelector('.btn-volver');
                    if (btnVolver) btnVolver.remove();
                    const hb = cw.querySelector('.dashboard-header .header-buttons');
                    if (hb) hb.remove();
                    content = cw.innerHTML;
                }
            }

            if (content) {
                // Inyectar CSS específicos de la vista
                doc.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
                    if (style.tagName.toLowerCase() === 'link') {
                        const href = style.getAttribute('href');
                        if (href && !document.querySelector(`link[href="${href}"]`)) {
                            const newLink = document.createElement('link');
                            newLink.rel = 'stylesheet';
                            newLink.href = href;
                            document.head.appendChild(newLink);
                        }
                    } else if (style.tagName.toLowerCase() === 'style') {
                        const newStyle = document.createElement('style');
                        newStyle.innerHTML = style.innerHTML;
                        document.head.appendChild(newStyle);
                    }
                });

                // Inyectar scripts del head (ej. Chart.js)
                doc.querySelectorAll('head script').forEach(script => {
                    const src = script.getAttribute('src');
                    if (src && !document.querySelector(`script[src="${src}"]`)) {
                        const newScript = document.createElement('script');
                        newScript.src = src;
                        document.head.appendChild(newScript);
                    }
                });

                wrapper.innerHTML = content;
                window.history.pushState({}, '', url);

                document.querySelectorAll('.sidebar-nav a.nav-link').forEach(l => {
                    l.classList.remove('active');
                    if (l.getAttribute('href') === url.split('/').pop() || (url === '' && l.getAttribute('href') === 'dashboard.html')) {
                        l.classList.add('active');
                    }
                });

                if (url.includes('dashboard.html') || url.endsWith('/admin/')) {
                    // Re-bind dashboard events and load data
                    btnCrearEvento = document.getElementById('btnCrearEvento');
                    if(btnCrearEvento) btnCrearEvento.addEventListener('click', () => { window.location.href = 'evento-form.html'; });
                    
                    btnEliminarPorFecha = document.getElementById('btnEliminarPorFecha');
                    if(btnEliminarPorFecha) btnEliminarPorFecha.addEventListener('click', eliminarPorFecha);
                    
                    btnEliminarSeleccionados = document.getElementById('btnEliminarSeleccionados');
                    if(btnEliminarSeleccionados) btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);

                    listaEventosDiv = document.getElementById('listaEventos');

                    const selectAll = document.getElementById('selectAll');
                    if(selectAll) selectAll.addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        document.querySelectorAll('.evento-check').forEach(cb => { cb.checked = isChecked; });
                        actualizarBotonEliminarSeleccionados();
                    });

                    const buscador = document.getElementById('buscadorEventos');
                    if(buscador) buscador.addEventListener('input', (e) => {
                        const texto = e.target.value.toLowerCase();
                        document.querySelectorAll('.evento-item').forEach(item => {
                            const details = item.querySelector('.evento-details');
                            item.style.display = (details && details.textContent.toLowerCase().includes(texto)) ? '' : 'none';
                        });
                    });

                    cargarEventos();
                } else {
                    const scripts = doc.querySelectorAll('script');
                    scripts.forEach(s => {
                        const src = s.getAttribute('src');
                        if (src && !src.includes('helpers.js') && !src.includes('common.js') && !src.includes('inactivity.js') && !src.includes('dashboard.js')) {
                            if (s.type === 'module') {
                                const newScript = document.createElement('script');
                                newScript.type = 'module';
                                newScript.src = src + '?t=' + Date.now();
                                document.body.appendChild(newScript);
                            } else {
                                fetch(src)
                                    .then(r => r.text())
                                    .then(code => {
                                        const script = document.createElement('script');
                                        // Wrap normal scripts in IIFE to prevent variable redeclaration errors (e.g. const/let at top level)
                                        script.textContent = `(async function() { \n${code}\n })();`;
                                        document.body.appendChild(script);
                                    });
                            }
                        }
                    });
                }
            }
        })
        .catch(err => {
            console.error("Error cargando SPA:", err);
            wrapper.innerHTML = '<div style="padding:40px; text-align:center; color:red;">Error al cargar la sección.</div>';
        });
}

document.querySelectorAll('.sidebar-nav a.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.includes('../index.html')) {
            e.preventDefault();
            loadPageSPA(href);
            
            // Cerrar menú en móviles al seleccionar una opción
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && window.innerWidth <= 992) {
                sidebar.classList.remove('open');
            }
        }
    });
});

window.addEventListener('popstate', () => {
    const url = window.location.pathname.split('/').pop() || 'dashboard.html';
    loadPageSPA(url);
});


