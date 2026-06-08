window.renderizarYAbrirModalPremium = function () {
    let modal = document.getElementById('globalPremiumModal');
    if (!modal) {
        // Create modal
        modal = document.createElement('div');
        modal.id = 'globalPremiumModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '99999';

        const modalContent = document.createElement('div');
        modalContent.style.background = 'white';
        modalContent.style.padding = '30px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.position = 'relative';
        modalContent.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        modalContent.style.textAlign = 'center';

        const btnClose = document.createElement('span');
        btnClose.innerHTML = '&times;';
        btnClose.style.position = 'absolute';
        btnClose.style.top = '10px';
        btnClose.style.right = '15px';
        btnClose.style.fontSize = '28px';
        btnClose.style.cursor = 'pointer';
        btnClose.style.color = '#999';
        btnClose.style.lineHeight = '1';
        btnClose.onclick = () => { modal.style.display = 'none'; };

        modalContent.appendChild(btnClose);

        const container = document.createElement('div');
        container.id = 'premium-modal-container';
        modalContent.appendChild(container);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Load PayPal SDK if not loaded
        if (typeof paypal === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://www.paypal.com/sdk/js?client-id=AS0KDrCSBbjFoUjpSbNuaC9bjkev3d1ZrJdCJTK88oKv-ih-a4rV9BSR9VEW85mu0uAIxLH9mleb2Z3W&currency=USD';
            script.onload = () => inicializarContenidoModal(container);
            document.head.appendChild(script);
        } else {
            inicializarContenidoModal(container);
        }
    } else {
        modal.style.display = 'flex';
        // Re-render in case user status changed
        const container = document.getElementById('premium-modal-container');
        if (container) {
            inicializarContenidoModal(container);
        }
    }
};

function inicializarContenidoModal(container) {
    var u = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!u) {
        if (window.abrirModalAuth) {
            document.getElementById('globalPremiumModal').style.display = 'none';
            window.abrirModalAuth('login');
            return;
        } else {
            showPremiumToast('Por favor inicia sesión primero.', 'error');
            return;
        }
    }

    var isPremium = u.premium_hasta && new Date() < new Date(u.premium_hasta);
    container.innerHTML = ''; // Clear previous content

    if (isPremium) {
        container.innerHTML = `
            <h3 style="color: #003087; margin-bottom: 15px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 1.5rem;">
                <i class="fab fa-paypal"></i> Apoya la plataforma
            </h3>
            <p style="color: #4a5568; margin-bottom: 25px; font-size: 1.05rem;">
                Ya eres usuario Premium, ¡muchas gracias por tu apoyo! Puedes hacer una donación voluntaria del monto que desees para seguir apoyándonos.
            </p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
                <span style="font-size: 1.3rem; font-weight: bold; color: #003087;">$</span>
                <input type="number" id="modal-donation-amount" value="5.00" min="1.00" step="1.00" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; width: 100px; text-align: center; font-size: 1.2rem;">
            </div>
            <a href="javascript:void(0)" id="btnMostrarDonacionModal"
                style="display: inline-block; background: #0070ba; color: white; padding: 12px 30px; border-radius: 25px; font-weight: bold; text-decoration: none; transition: background 0.3s ease; box-shadow: 0 4px 6px rgba(0, 112, 186, 0.3); font-size: 1.1rem;">
                <i class="fas fa-heart"></i> Donar
            </a>
            <div id="modal-paypal-button-container" style="display: none; margin-top: 20px; max-width: 100%; margin-left: auto; margin-right: auto;"></div>
        `;
    } else {
        container.innerHTML = `
            <h3 style="color: #003087; margin-bottom: 15px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 1.5rem;">
                <i class="fas fa-crown" style="color: #ffc107;"></i> Hazte Premium
            </h3>
            <p style="color: #4a5568; margin-bottom: 25px; font-size: 1.05rem;">
                Por solo <strong>$2.00</strong> obtén 15 días de acceso Premium y disfruta de la transmisión en vivo completamente sin anuncios.
            </p>
            <a href="javascript:void(0)" id="btnMostrarDonacionModal"
                style="display: inline-block; background: #0070ba; color: white; padding: 12px 30px; border-radius: 25px; font-weight: bold; text-decoration: none; transition: background 0.3s ease; box-shadow: 0 4px 6px rgba(0, 112, 186, 0.3); font-size: 1.1rem;">
                <i class="fab fa-paypal"></i> Convertirme en Premium ($2.00)
            </a>
            <div id="modal-paypal-button-container" style="display: none; margin-top: 20px; max-width: 100%; margin-left: auto; margin-right: auto;"></div>
        `;
    }

    const btn = document.getElementById('btnMostrarDonacionModal');
    if (btn) {
        btn.addEventListener('click', function () {
            this.style.display = 'none';
            const ppContainer = document.getElementById('modal-paypal-button-container');
            ppContainer.style.display = 'block';
            ppContainer.innerHTML = ''; // clear previous buttons if any

            paypal.Buttons({
                createOrder: function (data, actions) {
                    let currentAmount = "2.00";
                    let currentDesc = 'Suscripción Premium 15 Días - ExpoFeriasCR';

                    if (isPremium) {
                        const inputAmt = document.getElementById('modal-donation-amount');
                        if (inputAmt && parseFloat(inputAmt.value) > 0) {
                            currentAmount = parseFloat(inputAmt.value).toFixed(2);
                            currentDesc = 'Donación Voluntaria - ExpoFeriasCR';
                        } else {
                            showPremiumToast("Por favor ingresa un monto válido.", "error");
                            return actions.reject();
                        }
                    }

                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: currentAmount },
                            description: currentDesc
                        }]
                    });
                },
                onApprove: function (data, actions) {
                    return fetch('/api/pagos/capture', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({
                            orderID: data.orderID
                        })
                    }).then(res => res.json()).then(result => {
                        if (result.success) {
                            showPremiumToast('¡Pago completado con éxito! Gracias por tu apoyo.', 'success');
                            // update local user
                            let user = JSON.parse(localStorage.getItem('usuario'));
                            user.es_premium = 1;
                            if (result.nuevoVencimiento) {
                                user.premium_hasta = result.nuevoVencimiento;
                            }
                            localStorage.setItem('usuario', JSON.stringify(user));

                            // Close modal
                            document.getElementById('globalPremiumModal').style.display = 'none';

                            // Forzar un F5 (recarga de página) automático después de 2 segundos
                            // para que el usuario pueda ver la notificación de éxito antes de que se refresque
                            setTimeout(() => {
                                window.location.reload(true);
                            }, 2000);
                        } else {
                            showPremiumToast('Hubo un error al procesar el pago: ' + result.message, 'error');
                        }
                    }).catch(err => {
                        console.error('Error procesando pago:', err);
                        showPremiumToast('Error al procesar el pago. Por favor, intenta de nuevo.', 'error');
                    });
                }
            }).render('#modal-paypal-button-container');
        });
    }
}

function showPremiumToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    toast.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    toast.style.color = 'white';
    toast.style.padding = '15px 30px';
    toast.style.borderRadius = '30px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    toast.style.zIndex = '1000000';
    toast.style.fontWeight = 'bold';
    toast.style.fontSize = '1.1rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
