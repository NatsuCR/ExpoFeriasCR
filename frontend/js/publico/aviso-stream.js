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
                    <a href="streaming.html" target="_blank" id="btnEntrarStream" class="stream-btn stream-btn-entrar">Entrar</a>
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
    const btnEntrar = document.getElementById('btnEntrarStream');

    try {
        // 2. Consultar estado al backend
        const res = await fetch('/api/eventos/stream-aviso/estado');
        if (!res.ok) throw new Error('Error fetching stream status');
        const data = await res.json();

        if (data.activo && data.evento) {
            const eventoId = data.evento.id;
            let imgUrl = '/assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png';
            if (data.evento.imagen_portada) {
                let imgRaw = data.evento.imagen_portada;
                if (imgRaw.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(imgRaw);
                        if (parsed && parsed.length > 0) imgRaw = parsed[0];
                    } catch(e) {}
                }
                
                if (imgRaw.startsWith('http') || imgRaw.startsWith('/')) {
                    imgUrl = imgRaw;
                } else {
                    imgUrl = `/uploads/${imgRaw}`;
                }
            }
            img.src = imgUrl;

            let contentHTML = `<span style="font-weight:bold; font-size:1.1em; display:block; margin-bottom:4px; color: #1a237e;">${data.evento.nombre}</span>`;
            if (data.actividad) {
                contentHTML += `🔴 ¡${data.actividad.titulo} EN VIVO ahora mismo!`;
            } else {
                contentHTML += `🔴 ¡EN VIVO ahora mismo!`;
            }
            textEl.innerHTML = contentHTML;

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

            let adInjected = false;
            btnEntrar.addEventListener('click', () => {
                const isMobile = window.innerWidth <= 768;
                const u = JSON.parse(localStorage.getItem('usuario') || 'null');
                const isPremium = u && (u.rol === 'admin' || (u.premium_hasta && new Date() < new Date(u.premium_hasta)));
                
                if (isMobile && !isPremium && !adInjected) {
                    adInjected = true;
                    const script = document.createElement('script');
                    script.src = "https://pl29512242.effectivecpmnetwork.com/2f/ea/c5/2feac537f8e60dd7004660d723aa9672.js";
                    document.body.appendChild(script);
                }
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
