// admin-init.js
function configurarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (tabId === 'precios') cargarPrecios();
            if (tabId === 'actividades') cargarActividades();
            if (tabId === 'expositores') cargarExpositores();
            if (tabId === 'galeria') cargarGaleria();
        });
    });
}

// Asignar eventos de los botones principales
document.getElementById('guardarBasicos').addEventListener('click', guardarBasicos);
document.getElementById('btnAgregarPrecio').addEventListener('click', () => abrirModalPrecio());
document.getElementById('guardarPrecioBtn').addEventListener('click', guardarPrecioModal);
document.getElementById('cancelarPrecioBtn').addEventListener('click', cerrarModalPrecio);
document.getElementById('btnAgregarActividad').addEventListener('click', () => abrirModalActividad());
document.getElementById('guardarActividadBtn').addEventListener('click', guardarActividadModal);
document.getElementById('cancelarActividadBtn').addEventListener('click', cerrarModalActividad);
document.getElementById('btnAgregarExpositor').addEventListener('click', () => abrirModalExpositor());
document.getElementById('guardarExpositorBtn').addEventListener('click', guardarExpositorModal);
document.getElementById('cancelarExpositorBtn').addEventListener('click', cerrarModalExpositor);
document.getElementById('btnAgregarImagen').addEventListener('click', () => abrirModalGaleria());
document.getElementById('guardarGaleriaBtn').addEventListener('click', guardarGaleriaModal);
document.getElementById('cancelarGaleriaBtn').addEventListener('click', cerrarModalGaleria);

// Inicialización
if (eventoId) {
    cargarDatosEvento();
    cargarPrecios();
    cargarActividades();
    cargarExpositores();
    cargarGaleria();
}
configurarTabs();
configurarUploads();
configurarUploadsMulti();