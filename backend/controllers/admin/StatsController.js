// backend/controllers/StatsController.js
const pool = require('../../db');
const AdmZip = require('adm-zip');

class StatsController {
    // Obtener estadísticas generales (para el dashboard)
    async getStats(req, res) {
        try {
            // Visitas totales
            const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM visitas');
            const totalVisitas = totalResult[0].total;

            // Visitantes únicos (total)
            const [uniquesResult] = await pool.query('SELECT COUNT(DISTINCT ip_address) as uniques FROM visitas');
            const visitantesUnicos = uniquesResult[0].uniques;

            // Visitas de la última semana
            const [weekResult] = await pool.query(`
                SELECT COUNT(*) as weekVisits 
                FROM visitas 
                WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
            `);
            const visitasSemana = weekResult[0].weekVisits;

            // Visitas del último año
            const [yearResult] = await pool.query(`
                SELECT COUNT(*) as yearVisits 
                FROM visitas 
                WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            `);
            const visitasAnio = yearResult[0].yearVisits;

            // Visitas de hoy
            const [todayTotalResult] = await pool.query(`
                SELECT COUNT(*) as todayVisits 
                FROM visitas 
                WHERE DATE(visit_date) = CURDATE()
            `);
            const visitasHoy = todayTotalResult[0].todayVisits;

            // Visitantes únicos de hoy
            const [todayUniqueResult] = await pool.query(`
                SELECT COUNT(DISTINCT ip_address) as todayUnique 
                FROM visitas 
                WHERE DATE(visit_date) = CURDATE()
            `);
            const visitantesUnicosHoy = todayUniqueResult[0].todayUnique;

            // Visitas por página
            const [pagesResult] = await pool.query(`
                SELECT 
                    page_url,
                    COUNT(*) as total
                FROM visitas
                GROUP BY page_url
            `);
            const visitsByPage = pagesResult;

            // Visitas por día (últimos 7 días)
            const [dailyResult] = await pool.query(`
                SELECT 
                    DATE(visit_date) as date,
                    COUNT(*) as total
                FROM visitas
                WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(visit_date)
                ORDER BY date ASC
            `);
            const visitsByDay = dailyResult;

            res.json({
                success: true,
                total: totalVisitas,
                uniqueVisitors: visitantesUnicos,
                weekVisits: visitasSemana,
                yearVisits: visitasAnio,
                todayVisits: visitasHoy,
                todayUnique: visitantesUnicosHoy,
                byPage: visitsByPage,
                byDay: visitsByDay
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
        }
    }

    // Exportar detalle completo de visitas (CSV)
    async exportVisits(req, res) {
        try {
            const [rows] = await pool.query('SELECT id, ip_address, page_url, visit_date FROM visitas ORDER BY visit_date DESC');
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No hay datos para exportar' });
            }
            const headers = ['ID', 'IP Address', 'Page URL', 'Visit Date'];
            const csvRows = [];
            csvRows.push(headers.join(','));
            for (const row of rows) {
                csvRows.push([
                    row.id,
                    row.ip_address,
                    row.page_url,
                    row.visit_date
                ].join(','));
            }
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=visitas.csv');
            res.send(csvContent);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al exportar datos' });
        }
    }

    // Exportar resumen diario (CSV)
    async exportSummary(req, res) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    DATE(visit_date) as fecha,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos,
                    SUM(CASE WHEN page_url = '/' THEN 1 ELSE 0 END) as visitas_index,
                    SUM(CASE WHEN page_url = '/evento.html' THEN 1 ELSE 0 END) as visitas_evento
                FROM visitas
                GROUP BY DATE(visit_date)
                ORDER BY fecha DESC
            `);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'No hay datos para exportar' });
            }
            const headers = ['Fecha', 'Visitas Totales', 'Visitantes Únicos', 'Visitas Index', 'Visitas Evento'];
            const csvRows = [headers.join(',')];
            for (const row of rows) {
                const fecha = new Date(row.fecha).toISOString().slice(0,10);
                csvRows.push([
                    fecha,
                    row.total_visitas,
                    row.visitantes_unicos,
                    row.visitas_index,
                    row.visitas_evento
                ].join(','));
            }
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=resumen_visitas.csv');
            res.send(csvContent);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al exportar resumen' });
        }
    }

    // Exportar ZIP con tres archivos: detalle, resumen diario, resumen horario
    async exportZip(req, res) {
        try {
            const zip = new AdmZip();

            // 1. Detalle completo
            const [detailRows] = await pool.query('SELECT id, ip_address, page_url, visit_date FROM visitas ORDER BY visit_date DESC');
            let detailCsv = '\uFEFFID,IP Address,Page URL,Visit Date\n';
            for (const row of detailRows) {
                detailCsv += `${row.id},${row.ip_address},${row.page_url},${row.visit_date}\n`;
            }
            zip.addFile('detalle_visitas.csv', Buffer.from(detailCsv, 'utf8'));

            // 2. Resumen diario
            const [dailyRows] = await pool.query(`
                SELECT 
                    DATE(visit_date) as fecha,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos,
                    SUM(CASE WHEN page_url = '/' THEN 1 ELSE 0 END) as visitas_index,
                    SUM(CASE WHEN page_url = '/evento.html' THEN 1 ELSE 0 END) as visitas_evento
                FROM visitas
                GROUP BY DATE(visit_date)
                ORDER BY fecha DESC
            `);
            let dailyCsv = '\uFEFFFecha,Visitas Totales,Visitantes Únicos,Visitas Index,Visitas Evento\n';
            for (const row of dailyRows) {
                const fecha = new Date(row.fecha).toISOString().slice(0,10);
                dailyCsv += `${fecha},${row.total_visitas},${row.visitantes_unicos},${row.visitas_index},${row.visitas_evento}\n`;
            }
            zip.addFile('resumen_diario.csv', Buffer.from(dailyCsv, 'utf8'));

            // 3. Resumen horario (visitas por hora del día)
            const [hourlyRows] = await pool.query(`
                SELECT 
                    HOUR(visit_date) as hora,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos
                FROM visitas
                GROUP BY HOUR(visit_date)
                ORDER BY hora ASC
            `);
            let hourlyCsv = '\uFEFFHora,Visitas Totales,Visitantes Únicos\n';
            for (const row of hourlyRows) {
                hourlyCsv += `${row.hora},${row.total_visitas},${row.visitantes_unicos}\n`;
            }
            zip.addFile('resumen_horario.csv', Buffer.from(hourlyCsv, 'utf8'));

            // Enviar el ZIP
            const zipBuffer = zip.toBuffer();
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=estadisticas_visitas.zip');
            res.send(zipBuffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar el archivo ZIP' });
        }
    }
}

module.exports = StatsController;