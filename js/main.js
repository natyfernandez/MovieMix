import { reproducirTrailer } from './load_media.js';
import { loadMediaSection } from './load_media.js';
import { fetchTMDb } from './load_media.js';
import ('./modal_info.js');

document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');
    
    if (!usuarioAutenticado) {
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        const loginPath = `${window.location.origin}${basePath}/pages/login.html`;
        window.location.href = loginPath;
    } else {
        loadCarousel();
        loadMediaSection('Crimen', '#containerMediaCrimen', 'all');
        loadMediaSection('Romance', '#containerMediaRomance', 'all');
        loadMediaSection('Comedia', '#containerMediaComedia', 'all');
        loadMediaSection('Ciencia Ficción', '#containerMediaFiccion', 'all');
    }
});

async function loadCarousel() {
    const requiredSlides = 3;
    let slideCount = 0;
    const containerSlides = document.querySelector('.carousel-inner');
    const templateSlide = document.querySelector('.template-slide').content;
    const addedTitles = new Set();
    let currentPage = 1;

    while (slideCount < requiredSlides) {
        const mediaList = await fetchTMDb('trending/all/day', { page: currentPage });

        for (const media of mediaList.results) {
            if (slideCount >= requiredSlides) break;

            const posterPath = media.backdrop_path || media.poster_path;
            if (posterPath && !addedTitles.has(media.title || media.name)) {
                const image = new Image();
                const imageURL = `https://image.tmdb.org/t/p/w780${posterPath}`;
                image.src = imageURL;

                await image.decode();

                const slide = templateSlide.cloneNode(true);
                slide.querySelector('h2').textContent = media.title || media.name;
                slide.querySelector('p').textContent = media.media_type;

                slide.querySelector('img').src = imageURL;
                slide.querySelector('img').alt = media.title || media.name;

                const infoButton = slide.querySelector('.info-button');
                infoButton.addEventListener('click', () => {
                    actualizarModal(media, imageURL);
                });

                const trailerButton = slide.querySelector('.reproducir');
                const videoResults = await fetchTMDb(`movie/${media.id}/videos`, {});
                const trailer = videoResults.results.find(video => video.language === 'es' && video.type === 'Trailer') ||
                                videoResults.results.find(video => video.type === 'Trailer');
                if (trailer) {
                    trailerButton.href = `https://www.youtube.com/watch?v=${trailer.key}`;
                    trailerButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        reproducirTrailer(trailer.key);
                    });
                } else {
                    trailerButton.style.display = 'none'; 
                }

                if (slideCount === 0) {
                    slide.querySelector('.carousel-item').classList.add('active');
                }

                containerSlides.appendChild(slide);
                addedTitles.add(media.title || media.name);
                slideCount++;
            }
        }

        if (slideCount < requiredSlides) {
            currentPage++;
        }
    }
}

