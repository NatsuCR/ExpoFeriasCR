// admin-stats.js
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

let pagesChart = null;
let trendChart = null; // Antes llamado dailyChart
let currentFilterDate = null;

// Helper: Convertir código de país (ISO) a emoji de bandera
function getFlagEmoji(countryCode) {
    if (countryCode === 'XX' || !countryCode) return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Referencias a elementos
const filterDateInput = document.getElementById('filterDate');
const btnClearFilter = document.getElementById('btnClearFilter');
const filterStatus = document.getElementById('filterStatus');
const todayVisitsLabel = document.querySelector('.stat-card:nth-child(5) h3');
const todayUniqueLabel = document.querySelector('.stat-card:nth-child(6) h3');
const trendChartTitle = document.querySelector('.chart-box:nth-child(2) h3');

async function fetchStats(date = null) {
    try {
        document.getElementById('loadingMessage').style.display = 'block';
        let url = '/api/admin/stats';
        if (date) url += `?date=${date}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const data = await response.json();
        if (data.success) {
            updateUI(data, date);
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        console.error(error);
        const statsContent = document.getElementById('statsContent');
        if (statsContent) {
            statsContent.innerHTML = `<p class="error-message">Error al cargar las estadísticas. Intente más tarde.</p>`;
        }
    } finally {
        const loadingMsg = document.getElementById('loadingMessage');
        if (loadingMsg) loadingMsg.style.display = 'none';
    }
}

function updateUI(data, filteredDate) {
    // Actualizar números básicos
    document.getElementById('totalVisits').innerText = data.total;
    document.getElementById('uniqueVisitors').innerText = data.uniqueVisitors;
    
    // Si hay una fecha filtrada, ocultamos o cambiamos el contexto de "Semana" y "Año"
    const weekCard = document.querySelector('.stat-card:nth-child(3)');
    const yearCard = document.querySelector('.stat-card:nth-child(4)');
    
    if (filteredDate) {
        if (weekCard) weekCard.style.opacity = '0.3';
        if (yearCard) yearCard.style.opacity = '0.3';
        if (todayVisitsLabel) todayVisitsLabel.innerText = `Visitas (${filteredDate})`;
        if (todayUniqueLabel) todayUniqueLabel.innerText = `Unicos (${filteredDate})`;
        if (filterStatus) filterStatus.innerHTML = `Mostrando: <strong>Día específico (${filteredDate})</strong>`;
        if (btnClearFilter) btnClearFilter.style.display = 'inline-block';
        if (trendChartTitle) trendChartTitle.innerText = `Tráfico por Horas (${filteredDate})`;
    } else {
        if (weekCard) weekCard.style.opacity = '1';
        if (yearCard) yearCard.style.opacity = '1';
        document.getElementById('weekVisits').innerText = data.weekVisits;
        document.getElementById('yearVisits').innerText = data.yearVisits;
        if (todayVisitsLabel) todayVisitsLabel.innerText = 'Visitas Hoy';
        if (todayUniqueLabel) todayUniqueLabel.innerText = 'Visitantes Únicos Hoy';
        if (filterStatus) filterStatus.innerText = 'Mostrando: Resumen General';
        if (btnClearFilter) btnClearFilter.style.display = 'none';
        if (trendChartTitle) trendChartTitle.innerText = 'Tráfico de los Últimos 7 Días';
    }

    document.getElementById('todayVisits').innerText = data.todayVisits;
    document.getElementById('todayUnique').innerText = data.todayUnique;

    // --- Gráfico de visitas por página ---
    const pageLabels = data.byPage.map(item => item.label);
    const pageData = data.byPage.map(item => item.total);

    const colors = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#0033a0', '#e74c3c', '#1abc9c', '#34495e', '#d35400', '#7f8c8d'];
    const backgroundColors = pageLabels.map((_, i) => colors[i % colors.length]);

    if (pagesChart) pagesChart.destroy();
    const pagesCanvas = document.getElementById('pagesChart');
    if (pagesCanvas) {
        const pagesCtx = pagesCanvas.getContext('2d');
        pagesChart = new Chart(pagesCtx, {
            type: 'doughnut',
            data: {
                labels: pageLabels,
                datasets: [{
                    data: pageData,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw} visitas`
                        }
                    }
                }
            }
        });
    }

    // --- Gráfico de tendencia (Días o Horas) ---
    const trendLabels = data.chartData.map(item => item.label);
    const trendValues = data.chartData.map(item => item.total);

    if (trendChart) trendChart.destroy();
    const dailyCanvas = document.getElementById('dailyChart');
    if (dailyCanvas) {
        const trendCtx = dailyCanvas.getContext('2d');
        trendChart = new Chart(trendCtx, {
            type: data.chartType === 'hourly' ? 'bar' : 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: data.chartType === 'hourly' ? 'Visitas por Hora' : 'Visitas Diarias',
                    data: trendValues,
                    borderColor: '#3498db',
                    backgroundColor: data.chartType === 'hourly' ? 'rgba(52,152,219,0.7)' : 'rgba(52,152,219,0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    // --- Renderizar lista de países ---
    const countriesList = document.getElementById('countriesList');
    if (countriesList && data.byCountry) {
        countriesList.innerHTML = '';
        if (data.byCountry.length === 0) {
            countriesList.innerHTML = '<p style="text-align:center; padding: 10px; color: #6b7280;">No hay datos de países disponibles.</p>';
        } else {
            data.byCountry.forEach(c => {
                const flag = getFlagEmoji(c.country);
                const countryName = c.country === 'XX' ? 'Desconocido' : c.country;
                
                const item = document.createElement('div');
                item.className = 'country-item';
                item.innerHTML = `
                    <div class="country-item-info">
                        <span class="country-item-flag">${flag}</span>
                        <span>${countryName}</span>
                    </div>
                    <span class="country-item-total">${c.total}</span>
                `;
                countriesList.appendChild(item);
            });
        }
    }
}

// Eventos de Filtro
if (filterDateInput) {
    filterDateInput.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            currentFilterDate = selectedDate;
            fetchStats(selectedDate);
        }
    });
}

if (btnClearFilter) {
    btnClearFilter.addEventListener('click', () => {
        if (filterDateInput) filterDateInput.value = '';
        currentFilterDate = null;
        fetchStats();
    });
}

// Exportar ZIP
const btnExportarZip = document.getElementById('btnExportarZip');
if (btnExportarZip) {
    btnExportarZip.addEventListener('click', async () => {
        try {
            let url = '/api/admin/stats/zip';
            if (currentFilterDate) url += `?date=${currentFilterDate}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al generar ZIP');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = blobUrl; a.download = 'estadisticas_visitas.zip';
            document.body.appendChild(a); a.click(); a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
            alert('Error al exportar los datos');
        }
    });
}

// Inicializar
fetchStats();


