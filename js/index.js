// Scripts cargados globalmente desde index.html

/**
 * ARCHIVO PRINCIPAL DE JAVASCRIPT
 * Este archivo une los clicks de los botones (HTML) con las llamadas (API) y los dibujos (UI)
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

    // Guardamos el texto original para volver a ponerlo despues del "Cargando..."
    const btnLoadOriginalHTML = btnLoad.innerHTML;
    const btnViewOriginalHTML = btnView.innerHTML;

    // Estado local para evitar visualizar sin cargar
    let datosCargados = false;

    // EVENTO 1: Cuando el usuario aprieta "Cargar datos"
    btnLoad.addEventListener('click', async () => {
        // Ponemos el boton a girar
        UI.showLoadingState('btn-load-data', btnLoadOriginalHTML);
        
        try {
            // Llamamos al servicio
            const response = await ApiService.cargarDatos();
            datosCargados = true;
            alert("✅ ¡Sincronización Exitosa!\nDatos cargados correctamente. Ahora puedes visualizarlos."); 
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
        if (!datosCargados) {
            alert("⚠️ ¡Acción Requerida!\nPor favor, presiona el botón 'Cargar datos de APIs' antes de visualizar el panel.");
            return;
        }

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
