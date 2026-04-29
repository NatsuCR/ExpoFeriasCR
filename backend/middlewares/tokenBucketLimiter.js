/**
 * Middleware de Rate Limiting usando el algoritmo Token Bucket.
 * Permite ráfagas de tráfico pero mantiene un promedio constante.
 */

const buckets = new Map();

/**
 * @param {Object} options 
 * @param {number} options.capacity Máximo de tokens (peticiones) que puede acumular el cubo.
 * @param {number} options.refillRate Cuántos tokens se añaden por segundo.
 */
const tokenBucketLimiter = (options = { capacity: 10, refillRate: 1 }) => {
    const { capacity, refillRate } = options;

    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();

        if (!buckets.has(ip)) {
            buckets.set(ip, {
                tokens: capacity,
                lastRefill: now
            });
        }

        const bucket = buckets.get(ip);

        // Calcular cuántos tokens se han generado desde la última petición
        const deltaSeconds = (now - bucket.lastRefill) / 1000;
        const generatedTokens = deltaSeconds * refillRate;

        // Actualizar el bucket (sin sobrepasar la capacidad máxima)
        bucket.tokens = Math.min(capacity, bucket.tokens + generatedTokens);
        bucket.lastRefill = now;

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            // Opcional: Añadir cabeceras de Rate Limit
            res.setHeader('X-RateLimit-Limit', capacity);
            res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
            next();
        } else {
            console.warn(`[SECURITY] Rate Limit excedido para IP: ${ip}`);
            return res.status(429).json({
                error: 'Demasiadas peticiones',
                message: 'Por favor, espera un momento antes de intentarlo de nuevo.',
                retryAfter: Math.ceil((1 - bucket.tokens) / refillRate)
            });
        }
    };
};

module.exports = tokenBucketLimiter;
