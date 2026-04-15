const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔥 Ruta ABSOLUTA correcta al frontend
const uploadDir = path.join(process.cwd(), 'frontend', 'assets', 'uploads');

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `upload-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

class UploadController {
    async uploadFile(req, res) {
        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No se envió ningún archivo' });
            }

            // 🔥 Ruta que usará el frontend
            const fileUrl = `/assets/uploads/${req.file.filename}`;

            res.json({
                success: true,
                url: fileUrl
            });
        });
    }
}

module.exports = UploadController;