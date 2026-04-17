// backend/controllers/StatsController.js
const pool = require('../../db');
const AdmZip = require('adm-zip');

class StatsController {
    // Definir las páginas públicas para filtrar estadísticas
    static PUBLIC_PAGES_FILTER = "(page_url = '/' OR page_url LIKE '/index.html%' OR page_url LIKE '/evento.html%')";

    // Obtener estadísticas generales (para el dashboard)
    async getStats(req, res) {
        try {
            const { date } = req.query; // Formato YYYY-MM-DD
            const filter = StatsController.PUBLIC_PAGES_FILTER;
            
            let dateCondition = "";
            let dailyCondition = "visit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
            
            if (date) {
                // Validar formato de fecha simple
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    return res.status(400).json({ success: false, error: 'Formato de fecha inválido' });
                }
                dateCondition = ` AND DATE(visit_date) = '${date}'`;
            }

            // Visitas totales (basadas en el filtro de fecha si existe)
            const [totalResult] = await pool.query(`SELECT COUNT(*) as total FROM visitas WHERE ${filter} ${dateCondition}`);
            const totalVisitas = totalResult[0].total;

            // Visitantes únicos (basados en el filtro de fecha si existe)
            const [uniquesResult] = await pool.query(`SELECT COUNT(DISTINCT ip_address) as uniques FROM visitas WHERE ${filter} ${dateCondition}`);
            const visitantesUnicos = uniquesResult[0].uniques;

            // Visitas de la última semana (solo si no hay fecha específica)
            let visitasSemana = 0;
            if (!date) {
                const [weekResult] = await pool.query(`
                    SELECT COUNT(*) as weekVisits 
                    FROM visitas 
                    WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK) AND ${filter}
                `);
                visitasSemana = weekResult[0].weekVisits;
            }

            // Visitas del último año (solo si no hay fecha específica)
            let visitasAnio = 0;
            if (!date) {
                const [yearResult] = await pool.query(`
                    SELECT COUNT(*) as yearVisits 
                    FROM visitas 
                    WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND ${filter}
                `);
                visitasAnio = yearResult[0].yearVisits;
            }

            // Visitas de hoy (siempre las de hoy real o las del día elegido)
            const [todayTotalResult] = await pool.query(`
                SELECT COUNT(*) as todayVisits 
                FROM visitas 
                WHERE DATE(visit_date) = ${date ? `'${date}'` : 'CURDATE()'} AND ${filter}
            `);
            const visitasHoy = todayTotalResult[0].todayVisits;

            // Visitantes únicos de hoy
            const [todayUniqueResult] = await pool.query(`
                SELECT COUNT(DISTINCT ip_address) as todayUnique 
                FROM visitas 
                WHERE DATE(visit_date) = ${date ? `'${date}'` : 'CURDATE()'} AND ${filter}
            `);
            const visitantesUnicosHoy = todayUniqueResult[0].todayUnique;

            // Visitas por página con nombres de eventos resueltos
            const [pagesResult] = await pool.query(`
                SELECT 
                    CASE 
                        WHEN page_url = '/' OR page_url LIKE '/index.html%' THEN 'Página Principal'
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
                label: item.label || 'Evento Desconocido o Eliminado',
                total: item.total
            }));

            // Datos para el gráfico de tendencia o gráfico horario
            let chartData = [];
            let chartType = "daily";

            if (date) {
                // Gráfico por horas para el día seleccionado
                const [hourlyResult] = await pool.query(`
                    SELECT 
                        HOUR(visit_date) as hour,
                        COUNT(*) as total
                    FROM visitas
                    WHERE DATE(visit_date) = '${date}' AND ${filter}
                    GROUP BY HOUR(visit_date)
                    ORDER BY hour ASC
                `);
                
                // Mapear a 24 horas para asegurar que todas las horas existan en el gráfico
                chartData = Array.from({length: 24}, (_, i) => {
                    const found = hourlyResult.find(r => r.hour === i);
                    return { label: `${i}:00`, total: found ? found.total : 0 };
                });
                chartType = "hourly";
            } else {
                // Gráfico por día (últimos 7 días)
                const [dailyResult] = await pool.query(`
                    SELECT 
                        DATE(visit_date) as date,
                        COUNT(*) as total
                    FROM visitas
                    WHERE visit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND ${filter}
                    GROUP BY DATE(visit_date)
                    ORDER BY date ASC
                `);
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
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas', detail: error.message });
        }
    }

    // Exportar detalle completo de visitas (CSV)
    async exportVisits(req, res) {
        try {
            const filter = StatsController.PUBLIC_PAGES_FILTER;
            const [rows] = await pool.query(`SELECT id, ip_address, page_url, visit_date FROM visitas WHERE ${filter} ORDER BY visit_date DESC`);
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
                    COUNT(DISTINCT ip_address) as visitantes_unicos,
                    SUM(CASE WHEN page_url = '/' OR page_url LIKE '/index.html%' THEN 1 ELSE 0 END) as visitas_index,
                    SUM(CASE WHEN page_url LIKE '/evento.html%' THEN 1 ELSE 0 END) as visitas_evento
                FROM visitas
                WHERE ${filter}
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
            console.error('[StatsController.exportSummary]', error.stack);
            res.status(500).json({ error: 'Error al exportar resumen' });
        }
    }

    // Exportar ZIP con tres archivos: detalle, resumen diario, resumen horario
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

            // 1. Detalle completo (o del día)
            const [detailRows] = await pool.query(`SELECT id, ip_address, page_url, visit_date FROM visitas WHERE ${filter} ${dateCondition} ORDER BY visit_date DESC`);
            let detailCsv = '\uFEFFID,IP Address,Page URL,Visit Date\n';
            for (const row of detailRows) {
                detailCsv += `${row.id},${row.ip_address},${row.page_url},${row.visit_date}\n`;
            }
            zip.addFile('detalle_visitas.csv', Buffer.from(detailCsv, 'utf8'));

            // 2. Resumen diario (o de ese día específico)
            const [dailyRows] = await pool.query(`
                SELECT 
                    DATE(visit_date) as fecha,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos,
                    SUM(CASE WHEN page_url = '/' OR page_url LIKE '/index.html%' THEN 1 ELSE 0 END) as visitas_index,
                    SUM(CASE WHEN page_url LIKE '/evento.html%' THEN 1 ELSE 0 END) as visitas_evento
                FROM visitas
                WHERE ${filter} ${dateCondition}
                GROUP BY DATE(visit_date)
                ORDER BY fecha DESC
            `);
            let dailyCsv = '\uFEFFFecha,Visitas Totales,Visitantes Únicos,Visitas Index,Visitas Evento\n';
            for (const row of dailyRows) {
                const f = new Date(row.fecha).toISOString().slice(0,10);
                dailyCsv += `${f},${row.total_visitas},${row.visitantes_unicos},${row.visitas_index},${row.visitas_evento}\n`;
            }
            zip.addFile('resumen_diario.csv', Buffer.from(dailyCsv, 'utf8'));

            // 3. Resumen horario
            const [hourlyRows] = await pool.query(`
                SELECT 
                    HOUR(visit_date) as hora,
                    COUNT(*) as total_visitas,
                    COUNT(DISTINCT ip_address) as visitantes_unicos
                FROM visitas
                WHERE ${filter} ${dateCondition}
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
            res.setHeader('Content-Disposition', `attachment; filename=${filenamePrefix}.zip`);
            res.send(zipBuffer);
        } catch (error) {
            console.error('[StatsController.exportZip]', error.stack);
            res.status(500).json({ error: 'Error al generar el archivo ZIP' });
        }
    }
}

module.exports = StatsController;