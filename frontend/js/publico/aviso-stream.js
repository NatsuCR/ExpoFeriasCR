document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inyectar HTML del widget y el icono flotante
    const container = document.createElement('div');
    container.innerHTML = `
        <!-- Floating Icon -->
        <div id="streamAvisoIcon" class="stream-aviso-floating-icon" title="¡Evento En Vivo!">
            <i class="fas fa-video"></i>
        </div>

        <!-- Widget -->
        <div id="streamAvisoWidget" class="stream-aviso-widget">
            <img id="streamAvisoImg" src="" alt="Evento en vivo" class="stream-aviso-img">
            <div class="stream-aviso-content">
                <p class="stream-aviso-text" id="streamAvisoText"></p>
                <div class="stream-aviso-actions">
                    <button id="btnEsconderStream" class="stream-btn stream-btn-esconder">Esconder</button>
                    <a href="interstitial.html?url=streaming.html" class="stream-btn stream-btn-entrar">Entrar</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    const widget = document.getElementById('streamAvisoWidget');
    const icon = document.getElementById('streamAvisoIcon');
    const img = document.getElementById('streamAvisoImg');
    const textEl = document.getElementById('streamAvisoText');
    const btnEsconder = document.getElementById('btnEsconderStream');

    try {
        // 2. Consultar estado al backend
        const res = await fetch('/api/eventos/stream-aviso/estado');
        if (!res.ok) throw new Error('Error fetching stream status');
        const data = await res.json();

        if (data.activo && data.evento) {
            const eventoId = data.evento.id;
            const imgPath = data.evento.imagen_portada ? `/uploads/${data.evento.imagen_portada}` : '/assets/images/placeholder.jpg';
            img.src = imgPath;
            textEl.innerHTML = `<span style="font-weight:bold; font-size:1.1em; display:block; margin-bottom:4px;">${data.evento.nombre}</span> 🔴 ¡ExpoferiasCR está EN VIVO ahora mismo!`;

            // Verificar preferencia del usuario
            const isHidden = sessionStorage.getItem(`streamAvisoHidden_${eventoId}`);

            if (isHidden) {
                // Si lo escondió, mostrar solo el icono
                icon.classList.add('show');
            } else {
                // Si no lo ha escondido, mostrar widget inmediatamente
                widget.classList.add('show');
            }

            // 3. Event Listeners
            btnEsconder.addEventListener('click', () => {
                widget.classList.remove('show');
                sessionStorage.setItem(`streamAvisoHidden_${eventoId}`, 'true');
                
                // Mostrar icono después de esconder
                setTimeout(() => {
                    icon.classList.add('show');
                }, 300);
            });

            icon.addEventListener('click', () => {
                icon.classList.remove('show');
                widget.classList.add('show');
                sessionStorage.removeItem(`streamAvisoHidden_${eventoId}`);
            });
        }
    } catch (error) {
        console.error('No se pudo cargar el estado del aviso stream:', error);
    }
});
