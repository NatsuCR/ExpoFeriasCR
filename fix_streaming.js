const fs = require('fs');

const path = 'frontend/streaming.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the fake player link logic:
content = content.replace(
    /var isAdmin = u && u\.rol && String\(u\.rol\)\.toLowerCase\(\) === 'admin';\s*var adClicked = sessionStorage\.getItem\('streamingAdClicked'\) === 'true';\s*if \(!isAdmin && !adClicked\) \{/g,
    `var isAdmin = u && u.rol && String(u.rol).toLowerCase() === 'admin';
                                var adClicked = sessionStorage.getItem('streamingAdClicked') === 'true';
                                var isPremium = u && u.premium_hasta && new Date() < new Date(u.premium_hasta);

                                if (!isAdmin && !isPremium && !adClicked) {`
);

// 2. Replace the ad blocks to hide them from premium users
content = content.replace(/if \(!u \|\| u\.rol !== 'admin'\) \{/g, `if (!u || (u.rol !== 'admin' && (!u.premium_hasta || new Date() >= new Date(u.premium_hasta)))) {`);
content = content.replace(/if \(!u \|\| String\(u\.rol\)\.toLowerCase\(\) !== 'admin'\) \{/g, `if (!u || (String(u.rol).toLowerCase() !== 'admin' && (!u.premium_hasta || new Date() >= new Date(u.premium_hasta)))) {`);

// 3. Fix Native Banner block specifically
content = content.replace(
    /var isAdmin = u && u\.rol && String\(u\.rol\)\.toLowerCase\(\) === 'admin';\s*if \(!isAdmin\) \{\s*document\.write\('<scr' \+ 'ipt async="async" data-cfasync="false" src="https:\/\/pl29512241\.effectivecpmnetwork\.com\/c083045c1441aa427e4f38dd4dc7fc88\/invoke\.js"><\/scr' \+ 'ipt>'\);/g,
    `var isAdmin = u && u.rol && String(u.rol).toLowerCase() === 'admin';
                    var isPremium = u && u.premium_hasta && new Date() < new Date(u.premium_hasta);
                    if (!isAdmin && !isPremium) {
                        document.write('<scr' + 'ipt async="async" data-cfasync="false" src="https://pl29512241.effectivecpmnetwork.com/c083045c1441aa427e4f38dd4dc7fc88/invoke.js"></scr' + 'ipt>');`
);

// 4. Replace the paypal donation link with the actual Paypal SDK checkout button (in 3 languages)
content = content.replace(
    /<div class="donation-section"[\s\S]*?Donar con PayPal\s*<\/a>\s*<\/div>/g,
    `<div class="donation-section" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 25px; margin-bottom: 25px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="color: #003087; margin-bottom: 10px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <i class="fab fa-paypal" style="font-size: 1.5rem;"></i> Hazte Premium / Go Premium / Torne-se Premium
                </h3>
                <p style="color: #4a5568; margin-bottom: 15px; font-size: 0.95rem;">
                    <strong>ES:</strong> Por solo $2.00 obtén 15 días de acceso Premium y disfruta de la transmisión en vivo completamente sin anuncios.<br>
                    <strong>EN:</strong> For only $2.00 get 15 days of Premium access and enjoy the live stream completely ad-free.<br>
                    <strong>PT:</strong> Por apenas $2,00 obtenha 15 dias de acesso Premium e aproveite a transmissão ao vivo totalmente sem anúncios.
                </p>
                <a href="javascript:void(0)" id="btnMostrarOpcionesPremium"
                    style="display: inline-block; background: #0070ba; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; text-decoration: none; transition: background 0.3s ease; box-shadow: 0 2px 4px rgba(0, 112, 186, 0.3);">
                    <i class="fas fa-crown"></i> Convertirme en Premium ($2.00)
                </a>
                
                <div id="premium-checkout-container" style="display: none; margin-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    <div id="paypal-button-container"></div>
                </div>
            </div>

            <!-- Inicializar PayPal -->
            <script src="https://www.paypal.com/sdk/js?client-id=AS0KDrCSBbjFoUjpSbNuaC9bjkev3d1ZrJdCJTK88oKv-ih-a4rV9BSR9VEW85mu0uAIxLH9mleb2Z3W&currency=USD"></script>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const btn = document.getElementById('btnMostrarOpcionesPremium');
                    if (btn) {
                        btn.addEventListener('click', function() {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                if (typeof abrirModalAuth === 'function') {
                                    abrirModalAuth('login');
                                } else {
                                    alert("Debes iniciar sesión para comprar Premium.");
                                }
                                return;
                            }
                            this.style.display = 'none';
                            document.getElementById('premium-checkout-container').style.display = 'block';

                            paypal.Buttons({
                                createOrder: function(data, actions) {
                                    return actions.order.create({
                                        purchase_units: [{
                                            amount: { value: '2.00' },
                                            description: 'Suscripción Premium 15 Días - ExpoFeriasCR'
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
                                                window.mostrarAlertaPremium('¡Gracias por tu compra!', 'Tu cuenta ahora es Premium. Disfruta de la transmisión sin anuncios.', 'Genial', 'success');
                                            } else {
                                                alert('¡Pago completado! Disfruta de tu cuenta Premium.');
                                            }
                                            
                                            // Actualizar usuario local
                                            var u = JSON.parse(localStorage.getItem('usuario'));
                                            if(u) {
                                                var d = new Date();
                                                d.setDate(d.getDate() + 15);
                                                u.premium_hasta = d.toISOString();
                                                localStorage.setItem('usuario', JSON.stringify(u));
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
            </script>`
);

fs.writeFileSync(path, content);
console.log('✅ streaming.html actualizado con todo: PayPal, lenguajes y corrección del Native Banner.');
