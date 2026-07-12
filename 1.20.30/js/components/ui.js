/**
 * Funciones relacionadas con la manipulación del DOM y la UI del SaaS.
 */

const UI = {
    showLoadingState(buttonId, originalHTML) {
        const btn = document.getElementById(buttonId);
        if(btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i><span>Procesando...</span>`;
            
            if(!document.getElementById('spin-style')) {
                const style = document.createElement('style');
                style.id = 'spin-style';
                style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }
        }
    },

    resetButtonState(buttonId, htmlContent) {
        const btn = document.getElementById(buttonId);
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = htmlContent;
        }
    },

    updateKPIs(movies) {
        if (!movies || movies.length === 0) return;

        // Total Películas en Strapi
        document.getElementById('kpi-total').innerText = movies.length;

        // Promedio de Puntaje de toda la BD
        const avg = movies.reduce((acc, curr) => acc + (curr.promedioVotos || 0), 0) / movies.length;
        document.getElementById('kpi-avg').innerText = avg.toFixed(1);

        // Película Más Votada (Usamos cantidadVotos porque Strapi no guardó popularidad)
        const mostPopular = movies.reduce((prev, current) => ((prev.cantidadVotos || 0) > (current.cantidadVotos || 0)) ? prev : current);
        document.getElementById('kpi-pop').innerText = mostPopular.titulo || "Desconocida";
    },

    renderTable(movies) {
        const container = document.getElementById('table-container');
        
        if (!movies || movies.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No hay datos en Strapi para mostrar.</p>';
            return;
        }

        let html = `
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Géneros</th>
                        <th>Calificación</th>
                        <th>Total Votos</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Ordenamos de forma descendente por promedioVotos (Mayor nota primero)
        const peliculasOrdenadas = [...movies].sort((a, b) => {
            const notaB = b.promedioVotos || 0;
            const notaA = a.promedioVotos || 0;
            return notaB - notaA;
        });

        peliculasOrdenadas.forEach((movie, index) => {
            const delay = index * 0.1;
            
            // Calculamos color de la chapita según promedioVotos
            const score = movie.promedioVotos || 0;
            let badgeClass = 'medium';
            let icon = 'ph-star-half';
            
            if (score >= 8.0) {
                badgeClass = 'high';
                icon = 'ph-star ph-fill';
            }
            
            // CORRECCIÓN: Usamos movie.generos en lugar de la variable vieja inexistente
            html += `
                <tr class="animate-in" style="animation-delay: ${delay}s; opacity: 0;">
                    <td style="font-weight: 700;">${movie.titulo || 'Sin nombre'}</td>
                    <td><span class="badge" style="background:#e2e8f0; color:#475569;">${movie.generos || 'Varios'}</span></td>
                    <td>
                        <span class="status-badge ${badgeClass}">
                            <i class="ph ${icon}"></i> ${score.toFixed(1)}
                        </span>
                    </td>
                    <td><i class="ph ph-users" style="color: var(--text-secondary); margin-right:4px;"></i> ${movie.cantidadVotos || 0}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },
	    // --- FUNCIÓN PARA DIBUJAR EL GRÁFICO ---
    renderChart(movies) {
        const container = document.getElementById('chart-container');
        if (!container) return;

        // Limpiamos el placeholder y creamos el canvas
        container.innerHTML = '<canvas id="myChart" style="max-height:250px; max-width:100%;"></canvas>';

        // Tomamos los primeros 10 títulos y sus promedios de votos
        const labels = movies.map(m => m.titulo || 'Sin título').slice(0, 10);
        const data = movies.map(m => m.promedioVotos || 0).slice(0, 10);

        // Dibujamos el gráfico de barras
        new Chart(document.getElementById('myChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Promedio de Votos',
                    data: data,
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: '#4f46e5',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Puntaje' }
                    },
                    x: {
                        ticks: { maxRotation: 45, minRotation: 30 }
                    }
                }
            }
        });
    },
    // --- FIN DE LA FUNCIÓN ---

    showDataContainer() {
        document.getElementById('welcome-state').classList.add('hidden');
        document.getElementById('data-container').classList.remove('hidden');
    },

    showWelcomeState() {
        document.getElementById('welcome-state').classList.remove('hidden');
        document.getElementById('data-container').classList.add('hidden');
    }
	
};
