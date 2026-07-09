/**
 * Funciones relacionadas con la manipulación del DOM y la UI del SaaS.
 */

export const UI = {
    showLoadingState(buttonId, originalHTML) {
        const btn = document.getElementById(buttonId);
        if(btn) {
            btn.disabled = true;
            // Animación de carga usando icono Phosphor girando
            btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i><span>Procesando...</span>`;
            
            // Inyectamos estilo de rotación temporal si no existe
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

        // Total Películas
        document.getElementById('kpi-total').innerText = movies.length;

        // Promedio de Puntaje
        const avg = movies.reduce((acc, curr) => acc + curr.vote_average, 0) / movies.length;
        document.getElementById('kpi-avg').innerText = avg.toFixed(1);

        // Película Más Popular
        const mostPopular = movies.reduce((prev, current) => (prev.popularity > current.popularity) ? prev : current);
        document.getElementById('kpi-pop').innerText = mostPopular.title;
    },

    renderTable(movies) {
        const container = document.getElementById('table-container');
        
        if (!movies || movies.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No hay datos para mostrar.</p>';
            return;
        }

        let html = `
            <table class="styled-table">
                <thead>
                    <tr>
                        <th># ID</th>
                        <th>Título</th>
                        <th>Año</th>
                        <th>Calificación</th>
                        <th>Popularidad</th>
                    </tr>
                </thead>
                <tbody>
        `;

        movies.forEach((movie, index) => {
            const delay = index * 0.1;
            
            // Lógica para badge de color según calificación
            let badgeClass = 'medium';
            let icon = 'ph-star-half';
            if (movie.vote_average >= 8.5) {
                badgeClass = 'high';
                icon = 'ph-star-fill';
            }
            
            html += `
                <tr class="animate-in" style="animation-delay: ${delay}s; opacity: 0;">
                    <td style="color: var(--text-secondary);">#${movie.id}</td>
                    <td style="font-weight: 700;">${movie.title}</td>
                    <td>${movie.year}</td>
                    <td>
                        <span class="status-badge ${badgeClass}">
                            <i class="ph ${icon}"></i> ${movie.vote_average}
                        </span>
                    </td>
                    <td><i class="ph ph-trend-up" style="color: var(--text-secondary); margin-right:4px;"></i> ${movie.popularity}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },

    showDataContainer() {
        // Ocultar banner de bienvenida
        document.getElementById('welcome-state').classList.add('hidden');
        // Mostrar contenedor de datos
        document.getElementById('data-container').classList.remove('hidden');
    }
};
