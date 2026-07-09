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
                        <th># ID Strapi</th>
                        <th>Título</th>
                        <th>Géneros</th>
                        <th>Calificación</th>
                        <th>Total Votos</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Diccionario local de géneros TMDB para traducción inmediata
        const TMDB_GENRES = {
            28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia", 80: "Crimen", 99: "Documental", 
            18: "Drama", 10751: "Familia", 14: "Fantasía", 36: "Historia", 27: "Terror", 10402: "Música", 
            9648: "Misterio", 10749: "Romance", 878: "Ciencia Ficción", 10770: "Película de TV", 
            53: "Suspense", 10752: "Bélica", 37: "Western"
        };

        // Invertimos el array para que los registros más nuevos (con texto) salgan arriba
        const peliculasOrdenadas = [...movies].reverse();

        peliculasOrdenadas.forEach((movie, index) => {
            const delay = index * 0.1;
            
            // Calculamos color de la chapita según promedioVotos
            const score = movie.promedioVotos || 0;
            let badgeClass = 'medium';
            let icon = 'ph-star-half';
            
            if (score >= 8.0) {
                badgeClass = 'high';
                icon = 'ph-star-fill';
            }
            
            // Forzamos traducción inmediata si la API trae números
            let generosParseados = movie.generos || 'Varios';
            if (generosParseados.match(/\d+/)) {
                generosParseados = generosParseados.split(',').map(id => TMDB_GENRES[id.trim()] || id.trim()).join(', ');
            }
            
            html += `
                <tr class="animate-in" style="animation-delay: ${delay}s; opacity: 0;">
                    <td style="color: var(--text-secondary);">STR-${movie.id}</td>
                    <td style="font-weight: 700;">${movie.titulo || 'Sin nombre'}</td>
                    <td><span class="badge" style="background:#e2e8f0; color:#475569;">${generosParseados}</span></td>
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

    showDataContainer() {
        document.getElementById('welcome-state').classList.add('hidden');
        document.getElementById('data-container').classList.remove('hidden');
    },

    showWelcomeState() {
        document.getElementById('welcome-state').classList.remove('hidden');
        document.getElementById('data-container').classList.add('hidden');
    }
};
