// admin-stats.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let pagesChart = null;
let dailyChart = null;

async function fetchStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const data = await response.json();
        if (data.success) {
            updateUI(data);
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('statsContent').innerHTML = `<p class="error-message">Error al cargar las estadísticas. Intente más tarde.</p>`;
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';
    }
}

function updateUI(data) {
    document.getElementById('totalVisits').innerText = data.total;
    document.getElementById('uniqueVisitors').innerText = data.uniqueVisitors;
    document.getElementById('weekVisits').innerText = data.weekVisits;
    document.getElementById('yearVisits').innerText = data.yearVisits;
    document.getElementById('todayVisits').innerText = data.todayVisits;
    document.getElementById('todayUnique').innerText = data.todayUnique;

    // Gráfico de visitas por página
    const pageLabels = data.byPage.map(item => item.page_url === '/' ? 'Página Principal' : 'Detalle de Evento');
    const pageData = data.byPage.map(item => item.total);

    if (pagesChart) pagesChart.destroy();
    const pagesCtx = document.getElementById('pagesChart').getContext('2d');
    pagesChart = new Chart(pagesCtx, {
        type: 'doughnut',
        data: {
            labels: pageLabels,
            datasets: [{
                data: pageData,
                backgroundColor: ['#3498db', '#e67e22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });

    // Gráfico de tendencia diaria (últimos 7 días)
    const dailyLabels = data.byDay.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('es-CR', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    const dailyData = data.byDay.map(item => item.total);

    if (dailyChart) dailyChart.destroy();
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dailyLabels,
            datasets: [{
                label: 'Visitas',
                data: dailyData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52,152,219,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

// Exportar ZIP con todos los CSV
document.getElementById('btnExportarZip').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/admin/stats/zip', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al generar ZIP');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'estadisticas_visitas.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
        alert('Error al exportar los datos');
    }
});

// Inicializar
fetchStats();