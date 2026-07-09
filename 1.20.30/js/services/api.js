/**
 * ARCHIVO DE CONEXIÓN (API)
 * Consume datos directos de TMDB, resuelve géneros en texto y los almacena en Strapi v5.
 */

const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYjI3YjA5ZDNiZWY3YjgxNjM2NTBkNDJmNTA3MGY3YyIsIm5iZiI6MTc4MzYxOTIyMi41MjE5OTk4LCJzdWIiOiI2YTRmZGU5NjQ1YWY5ZWJiMWFiZTExNzQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.R8q8FRTZd5MBcLIxlWUmq8JQy9GEykxHfMlA1mx51uA';
const STRAPI_URL = 'https://gestionweb.frlp.utn.edu.ar/api/grupo12-peliculas'; 
const STRAPI_TOKEN = '8c457faa9e1976eda8492d0c470848626d5e7255008b189a8774819632c1e1c675acd69a6eaca57d7771e1c03e2b93b457f250d8007e6dcda81493b7199c7f76de93730cf2496417a057999bf78d10ddc89b11ecaa0e8787dc3abe97c79f69fde29cd958c93e7eb928419506215d60338d45ed8a9b71704b6c09a2050a64f86f';

const headersStrapi = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

const ApiService = {
    
    /**
     Consumir TMDB y guardar en Strapi (Validando por IdPelicula)
     */
    async cargarDatos() {
        try {
            //1: Obtener qué películas ya existen en Strapi para extraer sus IdPelicula
            const resExistentes = await fetch(`${STRAPI_URL}?status=all&pagination[pageSize]=100`, {
                method: 'GET',
                headers: headersStrapi
            });
            
            const jsonExistentes = await resExistentes.json();
            const pelisExistentes = jsonExistentes.data || [];
            
            // Creamos un Set con los IdPelicula numéricos que ya están guardados en Strapi
            const idsTMDBGuardados = new Set(
                pelisExistentes
                    .map(p => p.IdPelicula ? parseInt(p.IdPelicula) : null)
                    .filter(id => id !== null)
            );

            //2: Buscar películas de 1999 en TMDB
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
            
            //3: Mapear diccionario de géneros
            const urlGeneros = 'https://api.themoviedb.org/3/genre/movie/list?language=es-ES';
            const resGeneros = await fetch(urlGeneros, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${TMDB_API_KEY}`, 'accept': 'application/json' }
            });
            const datosGeneros = await resGeneros.json();
            
            const diccionarioGeneros = {};
            if (datosGeneros.genres) {
                datosGeneros.genres.forEach(g => {
                    diccionarioGeneros[g.id] = g.name;
                });
            }

            //4: Insertar en Strapi guardando el id original y controlando duplicados
            let nuevasCargadas = 0;
            for (const p of las10Peliculas) {
                
                // VALIDACIÓN: Si el ID de TMDB ya existe en el Set de Strapi, se saltea
                if (idsTMDBGuardados.has(p.id)) {
                    console.log(`⏩ Salteada (Ya existe IdPelicula ${p.id}): ${p.title}`);
                    continue; 
                }

                const generosTexto = p.genre_ids.map(id => diccionarioGeneros[id] || id).join(', ');

                const estructuraStrapi = {
                    data: {
                        titulo: p.title,
                        sinopsis: p.overview || "Sin sinopsis disponible.",
                        generos: generosTexto, 
                        cantidadVotos: p.vote_count,
                        promedioVotos: parseFloat(p.vote_average.toFixed(1)),
                        IdPelicula: p.id // Almacenamos el ID numérico de TMDB en tu columna de Strapi
                    }
                };

                await fetch(STRAPI_URL, {
                    method: 'POST',
                    headers: headersStrapi,
                    body: JSON.stringify(estructuraStrapi)
                });
                
                nuevasCargadas++;
                console.log(`✅ Guardada en Strapi: ${p.title} (IdPelicula: ${p.id})`);
            }
            
            return { 
                success: true, 
                message: nuevasCargadas > 0 
                    ? `Se importaron ${nuevasCargadas} películas nuevas.` 
                    : "No se agregaron películas nuevas (Lote ya sincronizado)." 
            };
            
        } catch (error) {
            console.error("Fallo al cargar datos:", error);
            throw error;
        }
    },

    /**
     * Consultar Strapi
     */
    async obtenerDatos() {
        try {
            const respuesta = await fetch(`${STRAPI_URL}?status=all&pagination[pageSize]=100`, {
                method: 'GET',
                headers: headersStrapi
            });
            
            if (!respuesta.ok) throw new Error("Fallo al traer los datos de la facultad");

            const resultado = await respuesta.json();
            const registrosRaw = resultado.data || [];
            
            //Extrae los campos limpios sin importar la subversión de Strapi v5
            const datosNormalizados = registrosRaw.map(item => {
                const c = item.attributes || item;
                return {
                    id: item.id,
                    titulo: c.titulo || 'Sin nombre',
                    sinopsis: c.sinopsis || '',
                    generos: c.generos || 'Varios',
                    cantidadVotos: parseInt(c.cantidadVotos) || 0,
                    promedioVotos: parseFloat(c.promedioVotos) || 0.0,
                    IdPelicula: c.IdPelicula
                };
            });

            return { success: true, data: datosNormalizados };

        } catch (error) {
            console.error("Fallo interpretando el JSON de Strapi:", error);
            throw error;
        }
    }
};