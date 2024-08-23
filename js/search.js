import { agregarALaLista } from './add_to_list.js'; 
import { reproducirTrailer, fetchTMDb } from './load_media.js';

let actualizarModal;

import('./modal_info.js').then(module => {
    actualizarModal = module.actualizarModal;
});

document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');
    
    if (!usuarioAutenticado) {
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        const loginPath = `${window.location.origin}${basePath}/pages/login.html`;
        window.location.href = loginPath;
    }
});

const apiKey = '6af430b0057121f98c0ff2cd689fcce7';

// Capturar el término de búsqueda de la URL
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('query');

if (searchQuery) {
    fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&language=es-ES`)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById('results');
            const template = document.querySelector('.template-results').content;

            if (data.results.length > 0) {
                data.results.forEach(media => {
                    if (media.media_type === 'movie' || media.media_type === 'tv') {
                        const posterPath = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default_image.jpg';
                        const resultItem = template.cloneNode(true);
                        
                        resultItem.querySelector('img').src = posterPath;
                        resultItem.querySelector('img').alt = media.title || media.name;
                        resultItem.querySelector('.card-title').textContent = media.title || media.name;
                        resultItem.querySelector('.card-text').textContent = `Año: ${media.release_date ? media.release_date.split('-')[0] : 'N/A'}`;
                        
                        // Enlace y botones
                        const trailerButton = resultItem.querySelector('.reproducir');
                        const infoButton = resultItem.querySelector('.info-button');
                        const addToListButton = resultItem.querySelector('.agregar-lista');

                        // Asignar eventos a los botones 
                        obtenerTrailer(media.media_type, media.id, trailerButton);
                        
                        infoButton.addEventListener('click', () => {
                            if (actualizarModal) {
                                actualizarModal(media, posterPath);
                            }
                        });

                        addToListButton.addEventListener('click', () => {
                            agregarALaLista(media);
                        });

                        resultsDiv.appendChild(resultItem);
                    }
                });
            } else {
                resultsDiv.innerHTML = `<p>No se encontraron resultados para "${searchQuery}".</p>`;
            }
        })
        .catch(error => {
            console.error('Error al obtener datos:', error);
            document.getElementById('results').innerHTML = `<p>Hubo un error al procesar su solicitud. Por favor, intente nuevamente más tarde.</p>`;
        });
} else {
    document.getElementById('results').innerHTML = `<p>No se proporcionó ninguna consulta de búsqueda.</p>`;
}

async function obtenerTrailer(mediaType, mediaId, trailerButton) {
    try {
        const videoResults = await fetchTMDb(`${mediaType}/${mediaId}/videos`, {});
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
    } catch (error) {
        console.error('Error al obtener videos:', error);
        trailerButton.style.display = 'none'; // Oculta el botón si hay un error al obtener videos
    }
}

