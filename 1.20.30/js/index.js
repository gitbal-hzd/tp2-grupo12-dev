/**
 * ARCHIVO PRINCIPAL DE JAVASCRIPT
 * Une las acciones del HTML con la lógica de las APIs y los dibujos de la UI.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Capturamos los botones del menu lateral
    const btnLoad = document.getElementById('btn-load-data');
    const btnView = document.getElementById('btn-view-data');
    const btnHome = document.getElementById('btn-home');

    const irAlInicio = () => {
        UI.showWelcomeState();
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    };

    if(btnHome) btnHome.addEventListener('click', irAlInicio);

    // Guardamos el texto original de los botones para los estados de carga
    const btnLoadOriginalHTML = btnLoad.innerHTML;
    const btnViewOriginalHTML = btnView.innerHTML;

    // EVENTO 1: Cargar datos desde TMDB e insertar nuevos en Strapi
    btnLoad.addEventListener('click', async () => {
        UI.showLoadingState('btn-load-data', btnLoadOriginalHTML);
        
        try {
            const response = await ApiService.cargarDatos();
            alert(`✅ Sincronización finalizada:\n${response.message}`); 
            
            // Opcional y recomendado: Auto-clickear visualizar para mostrar los cambios al instante
            btnView.click();
        } catch (error) {
            console.error(error);
            alert("❌ Error en la sincronización de datos.");
        } finally {
            UI.resetButtonState('btn-load-data', btnLoadOriginalHTML);
        }
    });

    // EVENTO 2: Visualizar datos directamente desde Strapi (Sin restricciones)
    btnView.addEventListener('click', async () => {
        UI.showLoadingState('btn-view-data', btnViewOriginalHTML);
        
        try {
            const response = await ApiService.obtenerDatos();
            
            if (response.success) {
                // NORMALIZACIÓN: Nos aseguramos de que los datos sean un array válido
                const listaPeliculas = Array.isArray(response.data) ? response.data : [];

                // Activamos la vista del contenedor de datos
                UI.showDataContainer();
                
                // Actualizamos las tarjetas de estadísticas (KPIs) y la tabla con los datos normalizados
                UI.updateKPIs(listaPeliculas);
                UI.renderTable(listaPeliculas);
                
                // Si la base de datos está vacía, avisamos amablemente sin romper nada
                if (listaPeliculas.length === 0) {
                    alert("ℹ️ El panel se abrió correctamente, pero tu base de datos en Strapi está vacía. Presiona 'Cargar datos de APIs' para poblarla.");
                }
            }
        } catch (error) {
            console.error("Error al visualizar Strapi:", error);
            alert("❌ No se pudieron recuperar los datos de Strapi.");
        } finally {
            UI.resetButtonState('btn-view-data', btnViewOriginalHTML);
        }
    });
});