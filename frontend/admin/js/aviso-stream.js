const toggleActivo = document.getElementById('toggleActivo');
const selectsContainer = document.getElementById('selectsContainer');
const btnGuardar = document.getElementById('btnGuardar');
const mensajeStatus = document.getElementById('mensajeStatus');
const actividadesContainer = document.getElementById('actividadesContainer');
const actividadSelect = document.getElementById('actividadSelect');

let selectsCreados = []; // Almacenar las referencias a los selects

// Cargar Eventos
async function cargarEventosAS() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/eventos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener eventos');
        const eventos = await res.json();
        
        if (selectsContainer) {
            selectsContainer.innerHTML = '';
            
            // Agrupar eventos por tipo_evento
            const eventosPorCategoria = {};
            eventos.forEach(ev => {
                const categoria = ev.tipo_evento || 'Otra Categoría';
                if (!eventosPorCategoria[categoria]) {
                    eventosPorCategoria[categoria] = [];
                }
                eventosPorCategoria[categoria].push(ev);
            });

            // Orden definido por el usuario (mismo orden que en el formulario de creación)
            const ordenCategorias = [
                "Deporte",
                "Feria",
                "Concierto",
                "Arte y Cultura",
                "Tour",
                "Fiesta Típica",
                "Gastronomía",
                "Exposición",
                "Talleres y Charlas",
                "Recreativa",
                "Gobierno / Cívico",
                "Religioso",
                "Otro"
            ];

            // Ordenar las categorías presentes basándose en el arreglo 'ordenCategorias'
            const categoriasPresentes = Object.keys(eventosPorCategoria).sort((a, b) => {
                let indexA = ordenCategorias.indexOf(a);
                let indexB = ordenCategorias.indexOf(b);
                
                // Si la categoría no está en la lista (ej. un valor antiguo o nulo), lo mandamos al final
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                
                return indexA - indexB;
            });

            // Crear los selects por categoría en el orden correcto
            categoriasPresentes.forEach(categoria => {
                const groupDiv = document.createElement('div');
                groupDiv.style.marginBottom = '15px';
                groupDiv.style.padding = '10px';
                groupDiv.style.background = '#f9f9f9';
                groupDiv.style.borderRadius = '8px';
                groupDiv.style.border = '1px solid #eee';

                const label = document.createElement('label');
                label.textContent = `📌 ${categoria}`;
                label.style.display = 'block';
                label.style.marginBottom = '5px';
                label.style.color = '#c8102e';
                label.style.fontWeight = 'bold';
                groupDiv.appendChild(label);

                const select = document.createElement('select');
                select.className = 'evento-categoria-select';
                select.style.width = '100%';
                select.style.padding = '10px';
                select.style.border = '1px solid #ccc';
                select.style.borderRadius = '5px';
                
                select.innerHTML = '<option value="">-- Ninguno --</option>';
                
                eventosPorCategoria[categoria].forEach(ev => {
                    const option = document.createElement('option');
                    option.value = ev.id;
                    option.textContent = ev.nombre;
                    select.appendChild(option);
                });

                // Cuando se selecciona un evento en esta categoría, reiniciar los demás selects
                select.addEventListener('change', async function() {
                    if (this.value !== "") {
                        // Ocultar los demás selects
                        selectsCreados.forEach(otherSelect => {
                            if (otherSelect !== this) {
                                otherSelect.value = "";
                                otherSelect.parentElement.style.display = 'none';
                            }
                        });
                        // Cargar las actividades para este evento
                        await cargarActividades(this.value);
                    } else {
                        // Si selecciona -- Ninguno --, volver a mostrar todos
                        selectsCreados.forEach(otherSelect => {
                            otherSelect.parentElement.style.display = 'block';
                        });
                        // Ocultar select de actividades
                        actividadesContainer.style.display = 'none';
                        actividadSelect.innerHTML = '<option value="">-- Ninguna (Solo mostrar el Evento) --</option>';
                    }
                });

                selectsCreados.push(select);
                groupDiv.appendChild(select);
                selectsContainer.appendChild(groupDiv);
            });
            
            if (Object.keys(eventosPorCategoria).length === 0) {
                selectsContainer.innerHTML = '<p>No hay eventos creados todavía.</p>';
            }
        }
    } catch (error) {
        console.error(error);
        if (selectsContainer) selectsContainer.innerHTML = '<p>Error al cargar eventos</p>';
    }
}

// Cargar actividades para un evento
async function cargarActividades(eventoId) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/eventos/${eventoId}/actividades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener actividades');
        const actividades = await res.json();
        
        actividadSelect.innerHTML = '<option value="">-- Ninguna (Solo mostrar el Evento) --</option>';
        if (actividades && actividades.length > 0) {
            actividades.forEach(act => {
                const option = document.createElement('option');
                option.value = act.id;
                option.textContent = act.titulo || act.nombre || 'Actividad';
                actividadSelect.appendChild(option);
            });
            actividadesContainer.style.display = 'block';
        } else {
            actividadesContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error cargando actividades:', error);
        actividadesContainer.style.display = 'none';
    }
}

// Cargar configuración actual
async function cargarConfigAS() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/stream-aviso', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener config');
        const config = await res.json();
        
        if (toggleActivo) toggleActivo.checked = config.activo;
        
        if (config.eventoId) {
            // Buscar el select que tenga este eventoId y asignarlo
            selectsCreados.forEach(select => {
                const options = Array.from(select.options);
                const hasOption = options.some(opt => opt.value == config.eventoId);
                if (hasOption) {
                    select.value = config.eventoId;
                    // Trigger the change visually (hide others)
                    selectsCreados.forEach(otherSelect => {
                        if (otherSelect !== select) {
                            otherSelect.value = "";
                            otherSelect.parentElement.style.display = 'none';
                        }
                    });
                } else {
                    select.value = "";
                }
            });

            // Si hay eventoId, cargamos sus actividades
            await cargarActividades(config.eventoId);
            
            // Si hay actividadId en la config, seleccionarlo
            if (config.actividadId) {
                actividadSelect.value = config.actividadId;
            }
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

// Guardar configuración
if (btnGuardar) {
    btnGuardar.addEventListener('click', async () => {
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';
        
        // Obtener el ID del evento seleccionado (solo debería haber uno o ninguno)
        let eventoSeleccionadoId = null;
        selectsCreados.forEach(select => {
            if (select.value !== "") {
                eventoSeleccionadoId = select.value;
            }
        });
        
        let actividadSeleccionadaId = null;
        if (eventoSeleccionadoId && actividadSelect.value !== "") {
            actividadSeleccionadaId = actividadSelect.value;
        }
        
        try {
            const token = localStorage.getItem('token');
            const data = {
                activo: toggleActivo.checked,
                eventoId: eventoSeleccionadoId,
                actividadId: actividadSeleccionadaId
            };

            const res = await fetch('/api/admin/stream-aviso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Error al guardar');
            
            if (mensajeStatus) {
                mensajeStatus.style.color = 'green';
                mensajeStatus.textContent = '¡Configuración guardada exitosamente!';
                setTimeout(() => { mensajeStatus.textContent = ''; }, 3000);
            }
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            if (mensajeStatus) {
                mensajeStatus.style.color = 'red';
                mensajeStatus.textContent = 'Error al guardar la configuración.';
            }
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar Configuración';
        }
    });
}

cargarEventosAS().then(() => {
    cargarConfigAS();
});
