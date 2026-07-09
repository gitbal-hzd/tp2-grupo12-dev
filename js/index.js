// Scripts cargados globalmente desde index.html

/**
 * ARCHIVO PRINCIPAL DE JAVASCRIPT
 * Este archivo une los clicks de los botones (HTML) con las llamadas (API) y los dibujos (UI)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Capturamos los botones del menu lateral
    const btnLoad = document.getElementById('btn-load-data');
    const btnView = document.getElementById('btn-view-data');

    // Guardamos el texto original para volver a ponerlo despues del "Cargando..."
    const btnLoadOriginalHTML = btnLoad.innerHTML;
    const btnViewOriginalHTML = btnView.innerHTML;

    // EVENTO 1: Cuando el usuario aprieta "Cargar datos"
    btnLoad.addEventListener('click', async () => {
        // Ponemos el boton a girar
        UI.showLoadingState('btn-load-data', btnLoadOriginalHTML);
        
        try {
            // Llamamos al servicio (que ahora usa mocks, despues usara Strapi)
            const response = await ApiService.cargarDatos();
            alert("✅ ¡Sincronización Exitosa!\nDatos cargados correctamente."); 
        } catch (error) {
            console.error(error);
            alert("❌ Error en la sincronización");
        } finally {
            // Siempre devolvemos el boton a la normalidad, falle o no
            UI.resetButtonState('btn-load-data', btnLoadOriginalHTML);
        }
    });

    // EVENTO 2: Cuando el usuario aprieta "Visualizar datos"
    btnView.addEventListener('click', async () => {
        // Ponemos el boton a girar
        UI.showLoadingState('btn-view-data', btnViewOriginalHTML);
        
        try {
            // Traemos las peliculas
            const response = await ApiService.obtenerDatos();
            
            if (response.success) {
                // 1. Ocultamos el cartel de bienvenida y mostramos el panel
                UI.showDataContainer();
                
                // 2. Calculamos los numeritos de las 3 tarjetas de arriba
                UI.updateKPIs(response.data);
                
                // 3. Dibujamos la tabla iterando el array
                UI.renderTable(response.data);
                
                // ATENCION INTEGRANTE 3:
                // Acá es donde debes instanciar tu librería de gráficos (ej. Chart.js)
                // pasandole el array "response.data".
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error obteniendo datos del servidor");
        } finally {
            // Devolvemos el boton a la normalidad
            UI.resetButtonState('btn-view-data', btnViewOriginalHTML);
        }
    });
});
