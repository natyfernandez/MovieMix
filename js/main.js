document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');
    
    if (!usuarioAutenticado) {
        window.location.href = './../pages/login.html';
    } else {
        loadCarousel();
        loadMediaSection();
        loadUserList();
    }
});

document.querySelector('.sign-out').addEventListener('click', function() {
    localStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioAutenticado');
    window.location.href = './../pages/login.html';
});

import './modal_info.js'; 

async function fetchTMDb(endpoint, params = {}) {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.search = new URLSearchParams({
        ...params,
        api_key: '6af430b0057121f98c0ff2cd689fcce7'
    });

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YWY0MzBiMDA1NzEyMWY5OGMwZmYyY2Q2ODlmY2NlNyIsIm5iZiI6MTcyNDI4ODI1NC45Njg0OTUsInN1YiI6IjY2YzY4YzIxMWVkNzY5ZmIwZTYwODgxNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.K-d4FC8kiaggFMRnGg8vuHNFy7Apio6Wm2We0Ae32lk`
        }
    });

    if (!response.ok) throw new Error('Error al obtener datos de la API de TMDb');
    return await response.json();
}

async function loadCarousel() {
    const requiredSlides = 3;
    let slideCount = 0;
    const containerSlides = document.querySelector('.carousel-inner');
    const templateSlide = document.querySelector('.template-slide').content;
    const addedTitles = new Set();
    let currentPage = 1;

    while (slideCount < requiredSlides) {
        const mediaList = await fetchTMDb('trending/all/day', { page: currentPage });
        console.log('Lista de medios para el carrusel:', mediaList);

        for (const media of mediaList.results) {
            if (slideCount >= requiredSlides) break;

            const posterPath = media.backdrop_path || media.poster_path;
            if (posterPath && !addedTitles.has(media.title || media.name)) {
                const image = new Image();
                const imageURL = `https://image.tmdb.org/t/p/w780${posterPath}`;
                image.src = imageURL;
                console.log(`Verificando imagen: ${image.src}`);

                await image.decode();

                if (image.width > image.height && !addedTitles.has(image.src)) {
                    console.log(`Añadiendo medio al carrusel: ${media.title || media.name}`);
                    const slide = templateSlide.cloneNode(true);
                    slide.querySelector('h2').textContent = media.title || media.name;
                    slide.querySelector('p').textContent = media.media_type;

                    slide.querySelector('img').src = image.src;
                    slide.querySelector('img').alt = media.title || media.name;

                    const infoButton = slide.querySelector('.info-button');
                    infoButton.addEventListener('click', () => {
                        actualizarModal(media, image.src);
                    });

                    if (slideCount === 0) {
                        slide.querySelector('.carousel-item').classList.add('active');
                    }

                    containerSlides.appendChild(slide);
                    addedTitles.add(media.title || media.name);
                    addedTitles.add(image.src);
                    slideCount++;
                } else {
                    console.log(`Imagen no adecuada para el carrusel (no horizontal o duplicada): ${media.title || media.name}`);
                    // Intentar obtener el trailer si no hay poster horizontal adecuado
                    const videoResults = await fetchTMDb(`movie/${media.id}/videos`, {});
                    const trailer = videoResults.results.find(video => video.type === 'Trailer');
                    if (trailer && !addedTitles.has(media.title || media.name)) {
                        console.log(`Añadiendo trailer al carrusel: ${media.title || media.name}`);
                        const slide = templateSlide.cloneNode(true);
                        slide.querySelector('h2').textContent = media.title || media.name;
                        slide.querySelector('p').textContent = media.media_type;

                        const videoElement = document.createElement('video');
                        videoElement.src = `https://www.youtube.com/embed/${trailer.key}`;
                        videoElement.setAttribute('controls', 'controls');
                        slide.querySelector('.carousel-item').innerHTML = '';
                        slide.querySelector('.carousel-item').appendChild(videoElement);

                        const infoButton = slide.querySelector('.info-button');
                        infoButton.addEventListener('click', () => {
                            actualizarModal(media, videoElement.src);
                        });

                        if (slideCount === 0) {
                            slide.querySelector('.carousel-item').classList.add('active');
                        }

                        containerSlides.appendChild(slide);
                        addedTitles.add(media.title || media.name);
                        slideCount++;
                    }
                }
            } else {
                console.log(`Medio omitido: ${media.title || media.name}, Poster: ${posterPath}`);
            }
        }

        if (slideCount < requiredSlides) {
            console.log(`No se encontraron suficientes slides, obteniendo más resultados...`);
            currentPage++;
        }
    }
}

async function loadMediaSection() {
    const mediaList = await fetchTMDb('discover/movie', { with_genres: 28 });
    console.log('Lista de medios para la sección:', mediaList);
    if (!mediaList) return;

    const containerMedia = document.querySelector('#containerMedia');
    const templateMedia = document.querySelector('.template-media').content;
    const carouselTitles = new Set();

    document.querySelectorAll('.carousel-inner h2').forEach(title => {
        carouselTitles.add(title.textContent);
    });

    mediaList.results.forEach(media => {
        if (!carouselTitles.has(media.title || media.name)) {
            console.log(`Añadiendo medio a la sección: ${media.title || media.name}`);
            const mediaItem = templateMedia.cloneNode(true);
            mediaItem.querySelector('h3').textContent = media.title || media.name;
            mediaItem.querySelector('p').textContent = media.release_date;

            const highResPoster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default_image.jpg';
            mediaItem.querySelector('img').src = highResPoster;
            mediaItem.querySelector('img').alt = media.title || media.name;

            const infoButton = mediaItem.querySelector('.info-button');
            infoButton.addEventListener('click', () => {
                actualizarModal(media, highResPoster);
            });

            const agregarLista = mediaItem.querySelector('.agregar-lista');
            agregarLista.addEventListener('click', () => {
                agregarALaLista(media);
            });

            containerMedia.append(mediaItem);
        } else {
            console.log(`Medio omitido para la sección (ya en el carrusel): ${media.title || media.name}`);
        }
    });
}

function agregarALaLista(media) {
    if (estaEnLaLista(media)) {
        console.log(`${media.title || media.name} ya está en tu lista`);
        Swal.fire({
            title: `${media.title || media.name} ya está en tu lista`,
            icon: "info"
        });
        return;
    }

    const containerList = document.querySelector('#containerList');
    const templateMedia = document.querySelector('.template-media').content;
    const mediaItem = templateMedia.cloneNode(true);

    console.log(`Añadiendo a la lista de usuario: ${media.title || media.name}`);

    mediaItem.querySelector('h3').textContent = media.title || media.name;
    mediaItem.querySelector('p').textContent = media.release_date;

    const highResPoster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default_image.jpg';
    mediaItem.querySelector('img').src = highResPoster;

    mediaItem.querySelector('.agregar-lista').classList.add('quitar-lista');
    const quitarLista = mediaItem.querySelector('.quitar-lista');
    quitarLista.classList.remove('agregar-lista');
    quitarLista.querySelector('.fa-plus').classList.add('fa-xmark');
    quitarLista.querySelector('.fa-xmark').classList.remove('fa-plus');

    Swal.fire({
        title: `${media.title || media.name} Agregado`,
        text: `¡Agregaste este título a tu lista con éxito!`,
        icon: "success"
    });

    quitarLista.addEventListener('click', () => {
        quitarDeLaLista(media);
    });

    containerList.append(mediaItem);
    guardarEnLocalStorage(media);
}

function estaEnLaLista(media) {
    const items = document.querySelectorAll('#containerList .media-item');
    for (let item of items) {
        if (item.querySelector('h3').textContent === media.title || media.name) {
            console.log(`Encontrado en la lista de usuario: ${media.title || media.name}`);
            return true;
        }
    }
    return false;
}

function quitarDeLaLista(media) {
    const items = document.querySelectorAll('#containerList .media-item');
    items.forEach(item => {
        if (item.querySelector('h3').textContent === media.title || media.name) {
            console.log(`Removing from user list: ${media.title || media.name}`);
            item.remove();
            Swal.fire({
                title: `${media.title || media.name} eliminado`,
                text: `Eliminaste este título de tu lista con éxito`,
                icon: "success"
            });
            eliminarDeLocalStorage(media.title || media.name);
        }
    });
}

function guardarEnLocalStorage(media) {
    let lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    lista.push(media);
    console.log('Saved to localStorage:', media.title || media.name);
    localStorage.setItem('listaMedia', JSON.stringify(lista));
}

function eliminarDeLocalStorage(titulo) {
    let lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    lista = lista.filter(media => media.title !== titulo);
    console.log(`Removed from localStorage: ${titulo}`);
    localStorage.setItem('listaMedia', JSON.stringify(lista));
}

function loadUserList() {
    const lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    console.log('User list loaded from localStorage:', lista);
    const containerList = document.querySelector('#containerList');
    const templateMedia = document.querySelector('.template-media').content;

    lista.forEach(media => {
        const mediaItem = templateMedia.cloneNode(true);
        mediaItem.querySelector('h3').textContent = media.title || media.name;
        mediaItem.querySelector('p').textContent = media.release_date || media.first_air_date;

        const highResPoster = media.poster_path ? `https://image.tmdb.org/t/p/w2000_and_h3000_bestv2${media.poster_path}` : 'default_image.jpg';
        mediaItem.querySelector('img').src = highResPoster;

        mediaItem.querySelector('.agregar-lista').classList.add('quitar-lista');
        const quitarLista = mediaItem.querySelector('.quitar-lista');
        quitarLista.classList.remove('agregar-lista');
        quitarLista.querySelector('.fa-plus').classList.add('fa-xmark');
        quitarLista.querySelector('.fa-xmark').classList.remove('fa-plus');

        quitarLista.addEventListener('click', () => {
            quitarDeLaLista(media);
        });

        containerList.append(mediaItem);
    });
}
