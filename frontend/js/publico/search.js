/**
 * publico/search.js - Lógica de búsqueda para la página principal
 */

window.realizarBusqueda = async function() {
    const pSel = document.getElementById('provincia-select');
    const cSel = document.getElementById('canton-select');
    const dSel = document.getElementById('distrito-select');
    const catSel = document.getElementById('categoria-select');
    const input = document.getElementById('buscador-principal');

    const filtros = {
        provincia: pSel ? pSel.value : '',
        canton: cSel ? cSel.value : '',
        distrito: dSel ? dSel.value : '',
        categoria: catSel ? catSel.value : '',
        termino: input ? input.value.trim() : ''
    };

    // Si todos los filtros están vacíos, no forzamos el scroll (o podríamos dejarlo opcional)
    const tieneFiltros = filtros.provincia || filtros.canton || filtros.distrito || filtros.categoria || filtros.termino;

    // Guardar globales si existen para persistencia mínima
    if (typeof provinciaActual !== 'undefined') provinciaActual = filtros.provincia;
    if (typeof busquedaActual !== 'undefined') busquedaActual = filtros.termino;

    // Llamar a cargar secciones con el objeto de filtros completo
    if (window.cargarSeccion) await window.cargarSeccion('/api/eventos/hoy', 'carousel-hoy-track', 'controls-hoy', false, filtros);
    if (window.cargarSeccion) await window.cargarSeccion('/api/eventos/en-progreso', 'carousel-vivo-track', 'controls-vivo', true, filtros);
    if (window.cargarProximos) await window.cargarProximos(filtros);
    if (window.cargarFinalizados) await window.cargarFinalizados(filtros);

    // Hacer scroll a los resultados solo si se aplicó algún filtro
    if (tieneFiltros) {
        // Encontrar el primer contenedor de eventos activo
        const eventosHoy = document.getElementById('eventos-hoy');
        const eventosVivo = document.getElementById('eventos-vivo');
        const eventosProximos = document.getElementById('categorias-proximos-container');
        
        let target = null;
        // Queremos bajar a la sección que está visible y tiene contenido
        if (eventosHoy && eventosHoy.style.display !== 'none') target = eventosHoy;
        else if (eventosVivo && eventosVivo.style.display !== 'none') target = eventosVivo;
        else target = eventosProximos;
        
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
};

window.configurarBuscadores = function() {
    const input = document.getElementById('buscador-principal');
    const btn = document.getElementById('btn-buscar-principal');
    const pSel = document.getElementById('provincia-select');
    const cSel = document.getElementById('canton-select');
    const dSel = document.getElementById('distrito-select');
    const catSel = document.getElementById('categoria-select');
    const btnInicio = document.getElementById('btnInicio');

    // Cascada de ubicación
    if (pSel && cSel) {
        pSel.addEventListener('change', () => {
            const prov = pSel.value;
            cSel.innerHTML = '<option value="">🏙️ Cantón</option>';
            dSel.innerHTML = '<option value="">🏘️ Distrito</option>';
            if (prov && window.UBICACIONES_CR && window.UBICACIONES_CR[prov]) {
                Object.keys(window.UBICACIONES_CR[prov]).forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c; opt.textContent = c;
                    cSel.appendChild(opt);
                });
            }
            window.realizarBusqueda();
        });
    }

    if (cSel && dSel) {
        cSel.addEventListener('change', () => {
            const prov = pSel.value;
            const can = cSel.value;
            dSel.innerHTML = '<option value="">🏘️ Distrito</option>';
            if (prov && can && window.UBICACIONES_CR && window.UBICACIONES_CR[prov] && window.UBICACIONES_CR[prov][can]) {
                window.UBICACIONES_CR[prov][can].forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d; opt.textContent = d;
                    dSel.appendChild(opt);
                });
            }
            window.realizarBusqueda();
        });
    }

    if (dSel) dSel.addEventListener('change', () => window.realizarBusqueda());
    if (catSel) catSel.addEventListener('change', () => window.realizarBusqueda());

    const resetear = () => {
        if (pSel) pSel.value = '';
        if (cSel) cSel.innerHTML = '<option value="">🏙️ Cantón</option>';
        if (dSel) dSel.innerHTML = '<option value="">🏘️ Distrito</option>';
        if (catSel) catSel.value = '';
        if (input) input.value = '';
        
        window.realizarBusqueda();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (btn && input) {
        btn.onclick = () => window.realizarBusqueda();
        input.onkeypress = (e) => { if (e.key === 'Enter') window.realizarBusqueda(); };
    }

    if (btnInicio) {
        btnInicio.onclick = (e) => {
            e.preventDefault();
            resetear();
        };
    }
};



