/**
 * ARCHIVO DE CONEXION (API)
 * Conecta el diseño visual con TMDB y Strapi.
 */

// Credenciales traídas del código de los compañeros (Int. 2)
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYjI3YjA5ZDNiZWY3YjgxNjM2NTBkNDJmNTA3MGY3YyIsIm5iZiI6MTc4MzYxOTIyMi41MjE5OTk4LCJzdWIiOiI2YTRmZGU5NjQ1YWY5ZWJiMWFiZTExNzQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.R8q8FRTZd5MBcLIxlWUmq8JQy9GEykxHfMlA1mx51uA';
const STRAPI_URL = 'https://gestionweb.frlp.utn.edu.ar/api/grupo12-peliculas'; 
const STRAPI_TOKEN = '8c457faa9e1976eda8492d0c470848626d5e7255008b189a8774819632c1e1c675acd69a6eaca57d7771e1c03e2b93b457f250d8007e6dcda81493b7199c7f76de93730cf2496417a057999bf78d10ddc89b11ecaa0e8787dc3abe97c79f69fde29cd958c93e7eb928419506215d60338d45ed8a9b71704b6c09a2050a64f86f';

const headersStrapi = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

const ApiService = {
    
    /**
     * TAREA INTEGRANTE 2: Consumir TMDB y guardar en Strapi
     * (Integrado exitosamente al Frontend)
     */
    async cargarDatos() {
        try {
            // Buscamos películas populares de 1999
            const urlTMDB = 'https://api.themoviedb.org/3/discover/movie?primary_release_year=1999&sort_by=popularity.desc&language=es-ES&page=1';
            const respuesta = await fetch(urlTMDB, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${TMDB_API_KEY}`, 
                    'accept': 'application/json' 
                }
            });

            if (!respuesta.ok) throw new Error("TMDB rechazó la solicitud");

            const datos = await respuesta.json();
            const las10Peliculas = datos.results.slice(0, 10); 

            // Hacemos el POST a Strapi una por una
            for (const p of las10Peliculas) {
                const estructuraStrapi = {
                    data: {
                        titulo: p.title,
                        sinopsis: p.overview || "Sin sinopsis disponible.",
                        generos: p.genre_ids.join(', '), 
                        cantidadVotos: p.vote_count,
                        promedioVotos: parseFloat(p.vote_average.toFixed(1))
                    }
                };

                await fetch(STRAPI_URL, {
                    method: 'POST',
                    headers: headersStrapi,
                    body: JSON.stringify(estructuraStrapi)
                });
            }
            
            return { success: true, message: "Datos cargados correctamente en Strapi" };
            
        } catch (error) {
            console.error("Fallo al cargar datos:", error);
            throw error;
        }
    },

    /**
     * TAREA INTEGRANTE 3: Consultar Strapi
     * (Integrado exitosamente al Frontend)
     */
    async obtenerDatos() {
        try {
            // Le pedimos a Strapi toda su base de datos
            const respuesta = await fetch(STRAPI_URL, {
                method: 'GET',
                headers: headersStrapi
            });
            
            if (!respuesta.ok) throw new Error("Fallo al traer los datos de la facultad");

            const resultado = await respuesta.json();
            
            return { success: true, data: resultado.data };
        } catch (error) {
            console.error("Fallo obteniendo Strapi:", error);
            throw error;
        }
    }
};
