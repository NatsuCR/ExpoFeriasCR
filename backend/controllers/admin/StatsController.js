// backend/controllers/StatsController.js
const pool = require('../../db');
const AdmZip = require('adm-zip');

class StatsController {
    // 🛡️ Filtro estricto para los informes del dashboard
    static PUBLIC_PAGES_FILTER = `(
        page_url = '/' 
        OR page_url = '/index.html' 
        OR page_url LIKE '/index.html?%' 
        OR (page_url LIKE '/evento.html%' AND page_url LIKE '%slug=%') 
        OR page_url LIKE '/crear-evento.html%' 
        OR page_url LIKE '/mi-cuenta.html%'
    ) AND page_url NOT LIKE '%preview=1%'`;

    // Obtener estadísticas generales (para el dashboard)
    async getStats(req, res) {
        try {
            const { date } = req.query;
            const filter = StatsController.PUBLIC_PAGES_FILTER;

            let dateCondition = "";
            if (date) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    return res.status(400).json({ success: false, error: 'Formato de fecha inválido' });
                }
                dateCondition = ` AND DATE(visit_date) = '${date}'`;
            }

            // Visitas totales
            const [totalResult] = await pool.query(`SELECT COUNT(*) as total FROM visitas WHERE ${filter} ${dateCondition}`);
            const totalVisitas = totalResult[0].total;

            // Visitantes únicos
            const [uniquesResult] = await pool.query(`SELECT COUNT(DISTINCT ip_address) as uniques FROM visitas WHERE ${filter} ${dateCondition}`);
            const visitantesUnicos = uniquesResult[0].uniques;

            // Otros contadores...
            let visitasSemana = 0;
            if (!date) {
                const [weekResult] = await pool.query(`SELECT COUNT(*) as weekVisits FROM visitas WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK) AND ${filter}`);
                visitasSemana = weekResult[0].weekVisits;
            }

            let visitasAnio = 0;
            if (!date) {
                const [yearResult] = await pool.query(`SELECT COUNT(*) as yearVisits FROM visitas WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND ${filter}`);
                visitasAnio = yearResult[0].yearVisits;
            }

            const [todayTotalResult] = await pool.query(`SELECT COUNT(*) as todayVisits FROM visitas WHERE DATE(visit_date) = ${date ? `'${date}'` : 'CURDATE()'} AND ${filter}`);
            const visitasHoy = todayTotalResult[0].todayVisits;

            const [todayUniqueResult] = await pool.query(`SELECT COUNT(DISTINCT ip_address) as todayUnique FROM visitas WHERE DATE(visit_date) = ${date ? `'${date}'` : 'CURDATE()'} AND ${filter}`);
            const visitantesUnicosHoy = todayUniqueResult[0].todayUnique;

            // 📊 Visitas por página con nombres resueltos
            const [pagesResult] = await pool.query(`
                SELECT 
                    CASE 
                        WHEN page_url = '/' OR page_url LIKE '/index.html%' THEN 'Página Principal'
                        WHEN page_url LIKE '/mi-cuenta.html%' THEN 'Mi Cuenta'
                        WHEN page_url LIKE '/crear-evento.html%' THEN 'Crear Evento'
                        WHEN page_url LIKE '%slug=%' THEN (
                            COALESCE(
                                (SELECT nombre FROM eventos WHERE slug = SUBSTRING_INDEX(SUBSTRING_INDEX(v.page_url, 'slug=', -1), '&', 1) COLLATE utf8mb4_unicode_ci LIMIT 1),
                                CONCAT('Evento: ', SUBSTRING_INDEX(SUBSTRING_INDEX(v.page_url, 'slug=', -1), '&', 1))
                            )
                        )
                        ELSE page_url
                    END as label,
                    COUNT(*) as total
                FROM visitas v
                WHERE ${filter} ${dateCondition}
                GROUP BY label
                ORDER BY total DESC
            `);

            const visitsByPage = pagesResult.map(item => ({
                label: item.label,
                total: item.total
            }));

            // Gráficos de tendencia...
            let chartData = [];
            let chartType = "daily";

            if (date) {
                const [hourlyResult] = await pool.query(`SELECT HOUR(visit_date) as hour, COUNT(*) as total FROM visitas WHERE DATE(visit_date) = '${date}' AND ${filter} GROUP BY HOUR(visit_date) ORDER BY hour ASC`);
                chartData = Array.from({ length: 24 }, (_, i) => {
                    const found = hourlyResult.find(r => r.hour === i);
                    return { label: `${i}:00`, total: found ? found.total : 0 };
                });
                chartType = "hourly";
            } else {
                const [dailyResult] = await pool.query(`SELECT DATE(visit_date) as date, COUNT(*) as total FROM visitas WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND ${filter} GROUP BY DATE(visit_date) ORDER BY date ASC`);
                chartData = dailyResult.map(r => ({
                    label: new Date(r.date).toLocaleDateString('es-CR', { weekday: 'short', month: 'short', day: 'numeric' }),
                    total: r.total
                }));
                chartType = "daily";
            }

            res.json({
                success: true,
                total: totalVisitas,
                uniqueVisitors: visitantesUnicos,
                weekVisits: visitasSemana,
                yearVisits: visitasAnio,
                todayVisits: visitasHoy,
                todayUnique: visitantesUnicosHoy,
                byPage: visitsByPage,
                chartData: chartData,
                chartType: chartType
            });
        } catch (error) {
            console.error('[StatsController.getStats]', error.stack);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
        }
    }

    // Exportar detalle completo de visitas (CSV)
    async exportVisits(req, res) {
        try {
            const filter = StatsController.PUBLIC_PAGES_FILTER;
            const [rows] = await pool.query(`SELECT id, ip_address, page_url, visit_date FROM visitas WHERE ${filter} ORDER BY visit_date DESC`);
            if (rows.length === 0) return res.status(404).json({ error: 'No hay datos para exportar' });
            
            let csvContent = '\uFEFFID,IP Address,Page URL,Visit Date\n';
            for (const row of rows) {
                csvContent += `${row.id},${row.ip_address},"${row.page_url}",${row.visit_date}\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=visitas.csv');
            res.send(csvContent);
        } catch (error) {
            console.error('[StatsController.exportVisits]', error.stack);
            res.status(500).json({ error: 'Error al exportar datos' });
        }
    }

    // Exportar resumen diario (CSV)
    async exportSummary(req, res) {
        try {
            const filter = StatsController.PUBLIC_PAGES_FILTER;
            const [rows] = await pool.query(`
                SELECT 
                    DATE(visit_date) as fecha,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos
                FROM visitas
                WHERE ${filter}
                GROUP BY DATE(visit_date)
                ORDER BY fecha DESC
            `);
            if (rows.length === 0) return res.status(404).json({ error: 'No hay datos para exportar' });
            
            let csvContent = '\uFEFFFecha,Visitas Totales,Visitantes Únicos\n';
            for (const row of rows) {
                const fecha = new Date(row.fecha).toISOString().slice(0, 10);
                csvContent += `${fecha},${row.total_visitas},${row.visitantes_unicos}\n`;
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=resumen_visitas.csv');
            res.send(csvContent);
        } catch (error) {
            console.error('[StatsController.exportSummary]', error.stack);
            res.status(500).json({ error: 'Error al exportar resumen' });
        }
    }

    // Exportar ZIP con tres archivos
    async exportZip(req, res) {
        try {
            const { date } = req.query;
            const zip = new AdmZip();
            const filter = StatsController.PUBLIC_PAGES_FILTER;

            let dateCondition = "";
            let filenamePrefix = "estadisticas_globales";

            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                dateCondition = ` AND DATE(visit_date) = '${date}'`;
                filenamePrefix = `estadisticas_${date}`;
            }

            const [detailRows] = await pool.query(`SELECT id, ip_address, page_url, visit_date FROM visitas WHERE ${filter} ${dateCondition} ORDER BY visit_date DESC`);
            let detailCsv = '\uFEFFID,IP Address,Page URL,Visit Date\n';
            for (const row of detailRows) {
                detailCsv += `${row.id},${row.ip_address},"${row.page_url}",${row.visit_date}\n`;
            }
            zip.addFile('detalle_visitas.csv', Buffer.from(detailCsv, 'utf8'));

            const [dailyRows] = await pool.query(`SELECT DATE(visit_date) as fecha, COUNT(*) as total_visitas, COUNT(DISTINCT ip_address) as visitantes_unicos FROM visitas WHERE ${filter} ${dateCondition} GROUP BY DATE(visit_date) ORDER BY fecha DESC`);
            let dailyCsv = '\uFEFFFecha,Visitas Totales,Visitantes Únicos\n';
            for (const row of dailyRows) {
                const f = new Date(row.fecha).toISOString().slice(0, 10);
                dailyCsv += `${f},${row.total_visitas},${row.visitantes_unicos}\n`;
            }
            zip.addFile('resumen_diario.csv', Buffer.from(dailyCsv, 'utf8'));

            const [hourlyRows] = await pool.query(`SELECT HOUR(visit_date) as hora, COUNT(*) as total_visitas, COUNT(DISTINCT ip_address) as visitantes_unicos FROM visitas WHERE ${filter} ${dateCondition} GROUP BY HOUR(visit_date) ORDER BY hora ASC`);
            let hourlyCsv = '\uFEFFHora,Visitas Totales,Visitantes Únicos\n';
            for (const row of hourlyRows) {
                hourlyCsv += `${row.hora},${row.total_visitas},${row.visitantes_unicos}\n`;
            }
            zip.addFile('resumen_horario.csv', Buffer.from(hourlyCsv, 'utf8'));

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=${filenamePrefix}.zip`);
            res.send(zip.toBuffer());
        } catch (error) {
            console.error('[StatsController.exportZip]', error.stack);
            res.status(500).json({ error: 'Error al generar el archivo ZIP' });
        }
    }
}

module.exports = new StatsController();



