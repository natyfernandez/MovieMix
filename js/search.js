document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');
    
    if (!usuarioAutenticado) {
        window.location.href = './../pages/login.html';
    } else {
        return;
    }
});

document.querySelector('.sign-out').addEventListener('click', function() {
    localStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioAutenticado');
    window.location.href = './../pages/login.html';
});

import('./modal_info.js');

const apiKey = '6af430b0057121f98c0ff2cd689fcce7';
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YWY0MzBiMDA1NzEyMWY5OGMwZmYyY2Q2ODlmY2NlNyIsIm5iZiI6MTcyNDI4ODI1NC45Njg0OTUsInN1YiI6IjY2YzY4YzIxMWVkNzY5ZmIwZTYwODgxNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.K-d4FC8kiaggFMRnGg8vuHNFy7Apio6Wm2We0Ae32lk';

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
                        
                        //Enlace y botones
                        const playButton = resultItem.querySelector('.btn-primary');
                        const infoButton = resultItem.querySelector('.btn-secondary');
                        const addToListButton = resultItem.querySelector('.agregar-lista');

                        // Asignar eventos a los botones 
                        playButton.href = media.video_path || '#'; 
                        infoButton.addEventListener('click', () => {
                            actualizarModal(media, posterPath);
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
