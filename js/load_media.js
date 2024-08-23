import { agregarALaLista } from './add_to_list.js'; 

export async function fetchTMDb(endpoint, params = {}) {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.search = new URLSearchParams({
        ...params,
        api_key: '6af430b0057121f98c0ff2cd689fcce7',
        language: 'es-ES'
    });

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YWY0MzBiMDA1NzEyMWY5OGMwZmYyY2Q2ODlmY2NlNyIsIm5iZiI6MTcyNDI4ODI1NC45Njg0OTUsInN1YiI6IjY2YzY4YzIxMWVkNzY5ZmIwZTYwODgxNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.K-d4FC8kiaggFMRnGg8vuHNFy7Apio6Wm2We0Ae32lk`
        }
    });

    if (!response.ok) throw new Error('Error al obtener datos de la API de TMDb');
    return await response.json();
}

export function reproducirTrailer(videoKey) {
    // Abre el trailer en una nueva ventana o pestaña
    window.open(`https://www.youtube.com/watch?v=${videoKey}`, '_blank');
}

export async function loadMediaSection(genreName, containerId, mediaType) {
    const genreId = getGenreId(genreName);

    if (!genreId) {
        console.error(`Género no encontrado: ${genreName}`);
        return;
    }

    let currentPage = 1;
    let mediaCount = 0;
    const maxMediaTotal = 4; // Limitar el total de resultados a 4
    const containerMedia = document.querySelector(containerId);
    const templateMedia = document.querySelector('.template-media').content;
    const carouselTitles = new Set();

    // Recopilar títulos existentes en el carrusel para evitar duplicados
    document.querySelectorAll('.carousel-inner h2').forEach(title => {
        carouselTitles.add(title.textContent);
    });

    while (mediaCount < maxMediaTotal) {
        let movies = [];
        let tvShows = [];
        let mediaList = [];

        if (mediaType === 'movie' || mediaType === 'all') {
            movies = await fetchTMDb('discover/movie', { with_genres: genreId, page: currentPage });
        }

        if (mediaType === 'tv' || mediaType === 'all') {
            tvShows = await fetchTMDb('discover/tv', { with_genres: genreId, page: currentPage });
        }

        // Concatenar y limitar resultados
        mediaList = [...(movies.results || []), ...(tvShows.results || [])].slice(0, maxMediaTotal);

        // Asegúrate de que `results` sea una lista
        if (Array.isArray(mediaList)) {
            await processMediaList(mediaList, containerMedia, templateMedia, carouselTitles, mediaCount, maxMediaTotal);
        } else {
            console.error('Se esperaba una lista de resultados, pero no se recibió una.');
        }

        // Terminar el bucle después de procesar una página
        break;
    }
}

async function processMediaList(results, containerMedia, templateMedia, carouselTitles, mediaCount, maxMediaTotal) {
    if (!Array.isArray(results)) {
        console.error('Se esperaba una lista de resultados, pero no se recibió una.');
        return;
    }

    for (const media of results) {
        if (mediaCount >= maxMediaTotal) break;

        // Determinar el tipo de media desde el resultado
        const mediaType = media.title ? 'movie' : 'tv';

        if (!carouselTitles.has(media.title || media.name)) {
            const mediaItem = templateMedia.cloneNode(true);
            mediaItem.querySelector('h3').textContent = media.title || media.name;
            mediaItem.querySelector('p').textContent = media.release_date || media.first_air_date;

            const highResPoster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default_image.jpg';
            mediaItem.querySelector('img').src = highResPoster;
            mediaItem.querySelector('img').alt = media.title || media.name;

            // Botón de trailer
            const trailerButton = mediaItem.querySelector('.reproducir');
            try {
                const videoResults = await fetchTMDb(`${mediaType}/${media.id}/videos`, {});
                if (Array.isArray(videoResults.results)) {
                    const trailer = videoResults.results.find(video => video.language === 'es' && video.type === 'Trailer') ||
                                    videoResults.results.find(video => video.type === 'Trailer');
                    if (trailer) {
                        trailerButton.href = `https://www.youtube.com/watch?v=${trailer.key}`;
                        trailerButton.addEventListener('click', (event) => {
                            event.preventDefault();
                            reproducirTrailer(trailer.key);
                        });
                    } else {
                        trailerButton.style.display = 'none'; // Oculta el botón si no hay trailer
                    }
                } else {
                    trailerButton.style.display = 'none'; // Oculta el botón si videoResults.results no es una lista
                }
            } catch (error) {
                console.error('Error al obtener videos:', error);
                trailerButton.style.display = 'none'; // Oculta el botón si hay un error al obtener videos
            }

            // Botón de información
            const infoButton = mediaItem.querySelector('.info-button');
            infoButton.addEventListener('click', () => {
                actualizarModal(media, highResPoster);
            });

            // Botón de agregar a la lista
            const agregarLista = mediaItem.querySelector('.agregar-lista');
            agregarLista.addEventListener('click', () => {
                agregarALaLista(media);
            });

            containerMedia.append(mediaItem);
            mediaCount++;
        }
    }
}

// Devuelve el ID del género basado en el nombre
function getGenreId(genreName) {
    const genreMap = {
        'Acción': 28,
        'Aventura': 12,
        'Animación': 16,
        'Comedia': 35,
        'Crimen': 80,
        'Documental': 99,
        'Drama': 18,
        'Familiar': 10751,
        'Fantasía': 14,
        'Historia': 36,
        'Terror': 27,
        'Música': 10402,
        'Misterio': 9648,
        'Romance': 10749,
        'Ciencia Ficción': 878,
        'Película para TV': 10770,
        'Suspense': 53,
        'Guerra': 10752,
        'Western': 37
    };
    return genreMap[genreName] || null;
}
