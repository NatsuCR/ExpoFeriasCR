const fs = require('fs');

// --- 1. Update PagosController.js ---
const controllerPath = 'backend/controllers/publico/PagosController.js';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const oldCheck = `                // Verificar que el monto sea 2.00
                const amount = captureData.purchase_units[0].payments.captures[0].amount.value;
                if (parseFloat(amount) !== 2.00) {
                    return res.status(400).json({ error: 'Monto incorrecto' });
                }

                // Actualizar DB: sumar 15 días a la fecha actual
                const [result] = await pool.query(
                    \`UPDATE usuarios 
                     SET premium_hasta = DATE_ADD(NOW(), INTERVAL 15 DAY) 
                     WHERE id = ?\`,
                    [usuarioId]
                );

                // Obtener datos del usuario
                const [users] = await pool.query('SELECT nombre, email FROM usuarios WHERE id = ?', [usuarioId]);
                
                if (users.length > 0) {
                    const userEmail = users[0].email;

                    // Enviar correo de confirmación
                    const emailService = require('../../services/emailService');
                    await emailService.notificarPremiumActivo(userEmail, users[0].nombre);

                    return res.json({ success: true, message: 'Pago verificado y premium activado por 15 días.' });
                } else {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }`;

const newCheck = `                // Obtener monto pagado
                const amount = captureData.purchase_units[0].payments.captures[0].amount.value;
                const parsedAmount = parseFloat(amount);

                if (parsedAmount <= 0) {
                    return res.status(400).json({ error: 'Monto inválido' });
                }

                // Si pagó $2 o más, le damos/extendemos 15 días de premium
                if (parsedAmount >= 2.00) {
                    // Actualizar DB: sumar 15 días a la fecha actual o extender si ya era premium
                    const [result] = await pool.query(
                        \`UPDATE usuarios 
                         SET premium_hasta = CASE 
                            WHEN premium_hasta > NOW() THEN DATE_ADD(premium_hasta, INTERVAL 15 DAY)
                            ELSE DATE_ADD(NOW(), INTERVAL 15 DAY)
                         END
                         WHERE id = ?\`,
                        [usuarioId]
                    );

                    // Obtener datos del usuario
                    const [users] = await pool.query('SELECT nombre, email FROM usuarios WHERE id = ?', [usuarioId]);
                    
                    if (users.length > 0) {
                        const userEmail = users[0].email;
                        const emailService = require('../../services/emailService');
                        await emailService.notificarPremiumActivo(userEmail, users[0].nombre);
                        return res.json({ success: true, message: 'Pago verificado. Premium activado/extendido por 15 días.', isPremium: true });
                    }
                }

                // Si es menos de 2.00, es solo una donación pequeña (sin premium)
                return res.json({ success: true, message: '¡Gracias por tu donación!', isPremium: false });`;

if (controllerContent.includes("if (parseFloat(amount) !== 2.00)")) {
    controllerContent = controllerContent.replace(oldCheck, newCheck);
    fs.writeFileSync(controllerPath, controllerContent);
    console.log("PagosController actualizado.");
}


// --- 2. Update streaming.html ---
const htmlPath = 'frontend/streaming.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldDonationSectionRegex = /<div class="donation-section"[\s\S]*?<\/script>/;

const newDonationSection = `<div class="donation-section" id="donation-section-container" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 25px; margin-bottom: 25px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <!-- Contenido dinámico (Premium o Donación) -->
            </div>

            <!-- Inicializar PayPal -->
            <script src="https://www.paypal.com/sdk/js?client-id=AS0KDrCSBbjFoUjpSbNuaC9bjkev3d1ZrJdCJTK88oKv-ih-a4rV9BSR9VEW85mu0uAIxLH9mleb2Z3W&currency=USD"></script>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    var u = JSON.parse(localStorage.getItem('usuario') || 'null');
                    var isPremium = u && u.premium_hasta && new Date() < new Date(u.premium_hasta);
                    
                    const container = document.getElementById('donation-section-container');
                    
                    if (isPremium) {
                        // UI para Donación Libre
                        container.innerHTML = \`
                            <h3 style="color: #003087; margin-bottom: 10px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                                <i class="fab fa-paypal" style="font-size: 1.5rem;"></i> Apoya nuestra transmisión / Support us / Apoie-nos
                            </h3>
                            <p style="color: #4a5568; margin-bottom: 15px; font-size: 0.95rem;">
                                <strong>ES:</strong> Eres Premium, ¡gracias! Puedes hacer una donación voluntaria del monto que desees para apoyarnos.<br>
                                <strong>EN:</strong> You're Premium, thanks! You can make a voluntary donation of any amount to support us.<br>
                                <strong>PT:</strong> Você é Premium, obrigado! Você pode fazer uma doação voluntária de qualquer valor para nos apoiar.
                            </p>
                            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 15px;">
                                <span style="font-size: 1.2rem; font-weight: bold; color: #003087;">$</span>
                                <input type="number" id="custom-donation-amount" value="5.00" min="1.00" step="1.00" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; width: 100px; text-align: center; font-size: 1.1rem;">
                                <a href="javascript:void(0)" id="btnMostrarDonacion"
                                    style="display: inline-block; background: #0070ba; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; text-decoration: none; transition: background 0.3s ease; box-shadow: 0 2px 4px rgba(0, 112, 186, 0.3);">
                                    <i class="fas fa-heart"></i> Donar / Donate
                                </a>
                            </div>
                            <div id="premium-checkout-container" style="display: none; margin-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                                <div id="paypal-button-container"></div>
                            </div>
                        \`;
                    } else {
                        // UI para Comprar Premium
                        container.innerHTML = \`
                            <h3 style="color: #003087; margin-bottom: 10px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                                <i class="fab fa-paypal" style="font-size: 1.5rem;"></i> Hazte Premium / Go Premium / Torne-se Premium
                            </h3>
                            <p style="color: #4a5568; margin-bottom: 15px; font-size: 0.95rem;">
                                <strong>ES:</strong> Por solo $2.00 obtén 15 días de acceso Premium y disfruta de la transmisión en vivo completamente sin anuncios.<br>
                                <strong>EN:</strong> For only $2.00 get 15 days of Premium access and enjoy the live stream completely ad-free.<br>
                                <strong>PT:</strong> Por apenas $2,00 obtenha 15 dias de acesso Premium e aproveite a transmissão ao vivo totalmente sem anúncios.
                            </p>
                            <a href="javascript:void(0)" id="btnMostrarDonacion"
                                style="display: inline-block; background: #0070ba; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; text-decoration: none; transition: background 0.3s ease; box-shadow: 0 2px 4px rgba(0, 112, 186, 0.3);">
                                <i class="fas fa-crown"></i> Convertirme en Premium ($2.00)
                            </a>
                            <div id="premium-checkout-container" style="display: none; margin-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                                <div id="paypal-button-container"></div>
                            </div>
                        \`;
                    }

                    const btn = document.getElementById('btnMostrarDonacion');
                    if (btn) {
                        btn.addEventListener('click', function() {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                if (typeof abrirModalAuth === 'function') {
                                    abrirModalAuth('login');
                                } else {
                                    alert("Debes iniciar sesión para realizar el pago.");
                                }
                                return;
                            }
                            
                            let amountToCharge = "2.00";
                            let paymentDesc = 'Suscripción Premium 15 Días - ExpoFeriasCR';
                            
                            if (isPremium) {
                                const inputAmt = document.getElementById('custom-donation-amount');
                                if(inputAmt && parseFloat(inputAmt.value) > 0) {
                                    amountToCharge = parseFloat(inputAmt.value).toFixed(2);
                                    paymentDesc = 'Donación Voluntaria - ExpoFeriasCR';
                                } else {
                                    alert("Por favor ingresa un monto válido.");
                                    return;
                                }
                            }

                            this.style.display = 'none';
                            if(document.getElementById('custom-donation-amount')) document.getElementById('custom-donation-amount').style.display = 'none';
                            document.getElementById('premium-checkout-container').style.display = 'block';

                            paypal.Buttons({
                                createOrder: function(data, actions) {
                                    return actions.order.create({
                                        purchase_units: [{
                                            amount: { value: amountToCharge },
                                            description: paymentDesc
                                        }]
                                    });
                                },
                                onApprove: function(data, actions) {
                                    return fetch('/api/pagos/capture', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                                        },
                                        body: JSON.stringify({ orderID: data.orderID })
                                    }).then(function(res) {
                                        return res.json();
                                    }).then(function(details) {
                                        if (details.success) {
                                            if (typeof window.mostrarAlertaPremium === 'function') {
                                                window.mostrarAlertaPremium('¡Gracias por tu apoyo!', details.message, 'Genial', 'success');
                                            } else {
                                                alert('¡Pago completado! ' + details.message);
                                            }
                                            
                                            // Actualizar usuario local si se dio premium (>= 2.00)
                                            if(parseFloat(amountToCharge) >= 2.00) {
                                                var u = JSON.parse(localStorage.getItem('usuario'));
                                                if(u) {
                                                    var d = u.premium_hasta ? new Date(Math.max(new Date(), new Date(u.premium_hasta))) : new Date();
                                                    d.setDate(d.getDate() + 15);
                                                    u.premium_hasta = d.toISOString();
                                                    localStorage.setItem('usuario', JSON.stringify(u));
                                                }
                                            }
                                            
                                            setTimeout(() => window.location.reload(), 2500);
                                        } else {
                                            alert('Hubo un problema con tu pago: ' + (details.error || 'Intenta nuevamente.'));
                                        }
                                    }).catch(err => {
                                        console.error('Error procesando pago', err);
                                        alert('Error de conexión al procesar el pago.');
                                    });
                                }
                            }).render('#paypal-button-container');
                        });
                    }
                });
            </script>`;

htmlContent = htmlContent.replace(oldDonationSectionRegex, newDonationSection);
fs.writeFileSync(htmlPath, htmlContent);
console.log("streaming.html actualizado.");
