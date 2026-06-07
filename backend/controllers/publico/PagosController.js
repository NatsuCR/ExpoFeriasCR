const pool = require('../../db');
const nodemailer = require('nodemailer');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use sandbox for now

async function getPayPalAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_SECRET).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if (!response.ok) {
        throw new Error('Error al obtener token de PayPal');
    }
    const data = await response.json();
    return data.access_token;
}

class PagosController {
    async captureOrder(req, res) {
        const { orderID } = req.body;
        const usuarioId = req.user.id;

        try {
            if (!orderID) {
                return res.status(400).json({ error: 'Falta el orderID' });
            }

            const accessToken = await getPayPalAccessToken();

            // Capturar la orden
            const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const captureData = await captureResponse.json();

            if (captureData.status === 'COMPLETED') {
                // Obtener monto pagado
                const amount = captureData.purchase_units[0].payments.captures[0].amount.value;
                const parsedAmount = parseFloat(amount);

                if (parsedAmount <= 0) {
                    return res.status(400).json({ error: 'Monto inválido' });
                }

                // Si pagó $2 o más, le damos/extendemos 15 días de premium
                if (parsedAmount >= 2.00) {
                    // Actualizar DB: sumar 15 días a la fecha actual o extender si ya era premium
                    const [result] = await pool.query(
                        `UPDATE usuarios 
                         SET premium_hasta = CASE 
                            WHEN premium_hasta > NOW() THEN DATE_ADD(premium_hasta, INTERVAL 15 DAY)
                            ELSE DATE_ADD(NOW(), INTERVAL 15 DAY)
                         END
                         WHERE id = ?`,
                        [usuarioId]
                    );

                    // Obtener datos del usuario incluyendo la nueva fecha
                    const [users] = await pool.query('SELECT nombre, email, premium_hasta FROM usuarios WHERE id = ?', [usuarioId]);
                    
                    if (users.length > 0) {
                        const userEmail = users[0].email;
                        const emailService = require('../../services/emailService');
                        await emailService.notificarPremiumActivo(userEmail, users[0].nombre);
                        return res.json({ 
                            success: true, 
                            message: 'Pago verificado. Premium activado/extendido por 15 días.', 
                            isPremium: true,
                            nuevoVencimiento: users[0].premium_hasta 
                        });
                    }
                }

                // Si es menos de 2.00, es solo una donación pequeña (sin premium)
                return res.json({ success: true, message: '¡Gracias por tu donación!', isPremium: false });
            } else {
                return res.status(400).json({ error: 'El pago no se pudo completar', details: captureData });
            }

        } catch (error) {
            console.error('Error en captureOrder:', error);
            res.status(500).json({ error: 'Error interno del servidor verificando el pago' });
        }
    }
}

module.exports = new PagosController();
