import { mockMovies } from '../mocks/mockData.js';

/**
 * ARCHIVO DE CONEXION (API)
 * =========================================================
 * Atención Integrantes 1 y 2: Cuando tengan sus endpoints reales de Strapi,
 * deben modificar unicamente este archivo. Reemplacen los Mocks por fetch().
 */

export const ApiService = {
    
    /**
     * TAREA INTEGRANTE 2: Consumir TMDB y guardar en Strapi
     * Reemplazar este setTimeout por la llamada POST a tu servidor
     */
    async cargarDatos() {
        return new Promise((resolve) => {
            // Simulamos que tarda 1.5 seg en ir a internet
            setTimeout(() => {
                resolve({ success: true, message: "Datos falsos cargados con éxito" });
            }, 1500); 
        });
    },

    /**
     * TAREA INTEGRANTE 3: Consultar Strapi
     * Reemplazar este setTimeout por un fetch GET a Strapi
     */
    async obtenerDatos() {
        return new Promise((resolve) => {
            // Simulamos que tarda 1 seg y devuelve nuestro archivo mockData.js
            setTimeout(() => {
                resolve({ success: true, data: mockMovies });
            }, 1000); 
        });
    }
};
