module.exports = (req, res, next) => {
    // 🔥 Middleware básico de tracking (temporal)

    // Ejemplo simple: log de cada request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

    next();
};