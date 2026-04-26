const fs = require('fs');
const path = require('path');

class FileService {
    /**
     * Elimina un archivo físico dado su URL relativa (/assets/uploads/...)
     * @param {string} relativeUrl 
     */
    static async eliminarArchivo(relativeUrl) {
        if (!relativeUrl || typeof relativeUrl !== 'string') return;
        
        // Solo procesar archivos locales que empiecen con /assets/uploads
        if (!relativeUrl.startsWith('/assets/uploads/')) {
            return;
        }

        try {
            // Construir ruta absoluta
            // relativeUrl: /assets/uploads/nombre.jpg
            // Queremos: [root]/frontend/assets/uploads/nombre.jpg
            const fileName = relativeUrl.replace('/assets/uploads/', '');
            const absolutePath = path.join(process.cwd(), 'frontend', 'assets', 'uploads', fileName);

            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
                console.log(`[FileService] Archivo eliminado: ${absolutePath}`);
            }
        } catch (error) {
            console.error(`[FileService] Error al intentar eliminar archivo ${relativeUrl}:`, error.message);
        }
    }

    /**
     * Elimina múltiples archivos físicos
     * @param {string[]} urls 
     */
    static async eliminarMultiples(urls) {
        if (!urls || !Array.isArray(urls)) return;
        
        for (const url of urls) {
            if (url) await this.eliminarArchivo(url);
        }
    }
}

module.exports = FileService;



