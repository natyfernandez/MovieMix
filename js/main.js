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

async function fetchMediaByYear(year, page = 1) {
    const url = `https://www.omdbapi.com/?s=new&y=${year}&apikey=eb786160&page=${page}&r=json`;
    console.log(`Fetching from URL: ${url}`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Fetched data:', data);
        return data.Response === 'True' ? data.Search : null;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function findRecentMedia(page = 1) {
    const currentYear = new Date().getFullYear();
    console.log(`Searching for year: ${currentYear}, page: ${page}`);
    let mediaList = await fetchMediaByYear(currentYear, page);
    if (!mediaList) {
        console.log(`No results for year: ${currentYear}, trying previous year.`);
        mediaList = await fetchMediaByYear(currentYear - 1, page);
    }
    return mediaList;
}

async function loadCarousel() {
    const requiredSlides = 3;
    let slideCount = 0;
    const containerSlides = document.querySelector('.carousel-inner');
    const templateSlide = document.querySelector('.template-slide').content;
    const addedTitles = new Set(); // Para rastrear títulos agregados al carrusel
    let currentPage = 1;

    while (slideCount < requiredSlides) {
        const mediaList = await findRecentMedia(currentPage);
        console.log('Media list for carousel:', mediaList);

        if (!mediaList || mediaList.length === 0) {
            console.log(`No media found on page ${currentPage}`);
            break;
        }

        for (const media of mediaList) {
            if (slideCount >= requiredSlides) break;

            if (media.Poster !== 'N/A' && !addedTitles.has(media.Title)) {
                const image = new Image();
                image.src = media.Poster.replace(/SX300/, '2000x3000');
                console.log(`Checking image: ${image.src}`);

                await image.decode(); // Esperar a que la imagen cargue

                if (image.width > image.height && !addedTitles.has(image.src)) { // Comprobar que no haya sido agregada
                    console.log(`Adding media to carousel: ${media.Title}`);
                    const slide = templateSlide.cloneNode(true);
                    slide.querySelector('h2').textContent = media.Title;
                    slide.querySelector('p').textContent = media.Type;

                    slide.querySelector('img').src = image.src;
                    slide.querySelector('img').alt = media.Title;

                    if (slideCount === 0) {
                        slide.querySelector('.carousel-item').classList.add('active');
                    }

                    // Set up the Play button
                    const playButton = slide.querySelector('.btn-primary');
                    playButton.href = media.Trailer || '#';
                    if (!media.Trailer || media.Trailer === '#') {
                        playButton.style.display = 'none'; // Hide if no trailer link
                    }

                    // Set up the Info button
                    const infoButton = slide.querySelector('.btn-secondary');
                    infoButton.addEventListener('click', () => {
                        Swal.fire({
                            title: media.Title,
                            text: `Year: ${media.Year}\nGenre: ${media.Genre}\nPlot: ${media.Plot}\nRuntime: ${media.Runtime}\nType: ${media.Type}`,
                            imageUrl: image.src,
                            imageAlt: media.Title
                        });
                    });

                    containerSlides.appendChild(slide);
                    addedTitles.add(media.Title); // Agregar título al set
                    addedTitles.add(image.src);   // Agregar src de la imagen al set
                    slideCount++;
                } else {
                    console.log(`Image not suitable for carousel (not horizontal or duplicate): ${media.Title}`);
                }
            } else {
                console.log(`Skipped media: ${media.Title}, Poster: ${media.Poster}`);
            }
        }

        if (slideCount < requiredSlides) {
            console.log(`Not enough slides found, fetching more results...`);
            currentPage++;
        }
    }
}

async function loadMediaSection() {
    const mediaList = await findRecentMedia();
    console.log('Media list for section:', mediaList);
    if (!mediaList) return;

    const containerMedia = document.querySelector('#containerMedia');
    const templateMedia = document.querySelector('.template-media').content;
    const carouselTitles = new Set(); // Almacena títulos del carrusel para evitar duplicados

    document.querySelectorAll('.carousel-inner h2').forEach(title => {
        carouselTitles.add(title.textContent);
    });

    mediaList.forEach(media => {
        if (!carouselTitles.has(media.Title)) { // Solo agregar si no está en el carrusel
            console.log(`Adding media to section: ${media.Title}`);
            const mediaItem = templateMedia.cloneNode(true);
            mediaItem.querySelector('h3').textContent = media.Title;
            mediaItem.querySelector('p').textContent = media.Year;

            const highResPoster = media.Poster !== 'N/A' ? `${media.Poster.replace(/SX300/, '2000x3000')}` : 'default_image.jpg';
            mediaItem.querySelector('img').src = highResPoster;
            mediaItem.querySelector('img').alt = media.Title;

            const agregarLista = mediaItem.querySelector('.agregar-lista');
            agregarLista.addEventListener('click', () => {
                agregarALaLista(media);
            });

            containerMedia.append(mediaItem);
        } else {
            console.log(`Skipped media for section (already in carousel): ${media.Title}`);
        }
    });
}

function agregarALaLista(media) {
    if (estaEnLaLista(media)) {
        console.log(`${media.Title} ya está en tu lista`);
        Swal.fire({
            title: `${media.Title} ya está en tu lista`,
            icon: "info"
        });
        return;
    }

    const containerList = document.querySelector('#containerList');
    const templateMedia = document.querySelector('.template-media').content;
    const mediaItem = templateMedia.cloneNode(true);

    console.log(`Adding to user list: ${media.Title}`);

    mediaItem.querySelector('h3').textContent = media.Title;
    mediaItem.querySelector('p').textContent = media.Year;

    const highResPoster = media.Poster !== 'N/A' ? `${media.Poster.replace(/SX300/, '2000x3000')}` : 'default_image.jpg';
    mediaItem.querySelector('img').src = highResPoster;

    mediaItem.querySelector('.agregar-lista').classList.add('quitar-lista');
    const quitarLista = mediaItem.querySelector('.quitar-lista');
    quitarLista.classList.remove('agregar-lista');
    quitarLista.querySelector('.fa-plus').classList.add('fa-xmark');
    quitarLista.querySelector('.fa-xmark').classList.remove('fa-plus');

    Swal.fire({
        title: `${media.Title} Agregado`,
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
        if (item.querySelector('h3').textContent === media.Title) {
            console.log(`Found in user list: ${media.Title}`);
            return true;
        }
    }
    return false;
}

function quitarDeLaLista(media) {
    const items = document.querySelectorAll('#containerList .media-item');
    items.forEach(item => {
        if (item.querySelector('h3').textContent === media.Title) {
            console.log(`Removing from user list: ${media.Title}`);
            item.remove();
            Swal.fire({
                title: `${media.Title} eliminado`,
                text: `Eliminaste este título de tu lista con éxito`,
                icon: "success"
            });
            eliminarDeLocalStorage(media.Title);
        }
    });
}

function guardarEnLocalStorage(media) {
    let lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    lista.push(media);
    console.log('Saved to localStorage:', media.Title);
    localStorage.setItem('listaMedia', JSON.stringify(lista));
}

function eliminarDeLocalStorage(titulo) {
    let lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    lista = lista.filter(media => media.Title !== titulo);
    console.log(`Removed from localStorage: ${titulo}`);
    localStorage.setItem('listaMedia', JSON.stringify(lista));
}

function loadUserList() {
    const lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
    const containerList = document.querySelector('#containerList');
    const templateMedia = document.querySelector('.template-media').content;

    lista.forEach(media => {
        console.log(`Loading from localStorage: ${media.Title}`);
        const mediaItem = templateMedia.cloneNode(true);
        mediaItem.querySelector('h3').textContent = media.Title;
        mediaItem.querySelector('p').textContent = media.Year;

        const highResPoster = media.Poster !== 'N/A' ? `${media.Poster.replace(/SX300/, '2000x3000')}` : 'default_image.jpg';
        mediaItem.querySelector('img').src = highResPoster;
        
        const quitarLista = mediaItem.querySelector('.agregar-lista');
        quitarLista.classList.add('quitar-lista');
        quitarLista.classList.remove('agregar-lista');
        quitarLista.querySelector('.fa-plus').classList.add('fa-xmark');
        quitarLista.querySelector('.fa-xmark').classList.remove('fa-plus');

        quitarLista.addEventListener('click', () => {
            quitarDeLaLista(media);
        });

        containerList.append(mediaItem);
    });
}
