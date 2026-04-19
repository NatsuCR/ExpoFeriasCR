const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'frontend', 'assets', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
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
    limits: { fileSize: 50 * 1024 * 1024 }, // Aumentado a 50MB para soportar videos cortos
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|ogg|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP) y videos (MP4, WEBM, MOV)'));
        }
    }
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
            // Devolver la ruta relativa para guardar en la base de datos
            const fileUrl = `/assets/uploads/${req.file.filename}`;
            res.json({ success: true, url: fileUrl });
        });
    }
}

module.exports = new UploadController();