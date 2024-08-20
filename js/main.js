document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');

    if (!usuarioAutenticado) {
        window.location.href = './../pages/login.html';
    }
});

document.querySelector('.sign-out').addEventListener('click', function() {
    localStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioAutenticado');
    window.location.href = './../pages/login.html';
});

const apiKey = 'eb786160';
const maxResults = 10; // Número máximo de resultados

// Función para obtener las películas/series de un año específico
async function fetchMediaByYear(year, page = 1) {
    try {
        const url = `https://www.omdbapi.com/?s=new&y=${year}&apikey=${apiKey}&page=${page}&r=json`;
        console.log(`Fetching from URL: ${url}`); // Log para depuración
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'False' || !data.Search) {
            console.error(`Error fetching data: ${data.Error}`);
            return [];
        }

        console.log(`Fetched data:`, data); // Log para depuración
        return data.Search || [];
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return [];
    }
}

// Buscar películas/series para un año y, si no hay suficientes, buscar en años anteriores
async function findRecentMedia() {
    let year = new Date().getFullYear();
    let media = [];
    let page = 1;

    while (media.length < maxResults && year > 1900) {
        console.log(`Searching for year: ${year}, page: ${page}`);
        let currentPageResults = await fetchMediaByYear(year, page);

        // Si la página 1 no devuelve resultados y hay más páginas, buscar en la siguiente página
        if (currentPageResults.length === 0 && page === 1) {
            page++;
            currentPageResults = await fetchMediaByYear(year, page);
        }

        media = [...media, ...currentPageResults];
        year--; // Buscar en años anteriores si no hay suficientes resultados

        if (media.length >= maxResults || year <= 1900) {
            break; // Salir del bucle si se han encontrado suficientes resultados o si se ha alcanzado el límite de años
        }

        page = 1; // Reiniciar la página para el próximo año
    }

    return media.slice(0, maxResults); // Asegurarse de no exceder el número máximo de resultados
}

// Función para inicializar el carrusel con las primeras 5 películas/series
async function loadCarousel() {
    const recentMedia = await findRecentMedia();
    const top5 = recentMedia.slice(0, 3);

    let containerSlides = document.querySelector('.carousel-inner');

    const templateSlide = document.querySelector('.template-slide');
    if (!templateSlide) {
        console.error('Template slide not found');
        return;
    }

    top5.forEach((media, index) => {
        let copiaSlides = templateSlide.content.cloneNode(true);
        copiaSlides.querySelector('h2').textContent = media.Title;
        copiaSlides.querySelector('p').textContent = media.Year;
        copiaSlides.querySelector('img').src = media.Poster !== "N/A" ? media.Poster : './assets/default.jpg';

        if (index === 0) {
            copiaSlides.querySelector('.carousel-item').classList.add('active');
        }

        containerSlides.appendChild(copiaSlides);
    });
}

// Función para cargar las películas/series en la sección principal
async function loadMediaSection(page = 1) {
    const recentMedia = await findRecentMedia();

    let containerMedia = document.querySelector('#containerMedia');

    const templateMedia = document.querySelector('.template-media');
    if (!templateMedia) {
        console.error('Template media not found');
        return;
    }

    recentMedia.forEach((media) => {
        let copiaMedia = templateMedia.content.cloneNode(true);
        copiaMedia.querySelector('h3').textContent = media.Title;
        copiaMedia.querySelector('p').textContent = media.Type || 'Unknown'; // Manejo de tipo
        copiaMedia.querySelector('img').src = media.Poster !== "N/A" ? media.Poster : './assets/default.jpg';
        copiaMedia.querySelector('img').alt = media.Title;

        let agregarLista = copiaMedia.querySelector('.agregar-lista');
        agregarLista.addEventListener('click', () => {
            agregarALaLista(media);
        });

        containerMedia.append(copiaMedia);
    });
}

// Inicializar el carrusel y la sección de películas
document.addEventListener('DOMContentLoaded', function() {
    loadCarousel();
    loadMediaSection();
});

// Función para agregar un medio a la lista
function agregarALaLista(media) {
    // Verificar si el medio ya está en la lista
    if (estaEnLaLista(media)) {
        Swal.fire({
            title: `${media.Title} ya está en tu lista`,
            icon: "info"
        });
        return;
    }

    let copiaLista = document.querySelector('.template-media').content.cloneNode(true);
    copiaLista.querySelector('h3').textContent = media.Title;
    copiaLista.querySelector('p').textContent = media.Type || 'Unknown'; // Manejo de tipo
    copiaLista.querySelector('img').src = media.Poster !== "N/A" ? media.Poster : './assets/default.jpg';

    copiaLista.querySelector('.agregar-lista').classList.add('quitar-lista');
    let quitarLista = copiaLista.querySelector('.quitar-lista');
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

    document.querySelector('#containerList').append(copiaLista);
}

// Función para verificar si el medio ya está en la lista
function estaEnLaLista(media) {
    let items = document.querySelector('#containerList').querySelectorAll('.media-item');
    for (let item of items) {
        if (item.querySelector('h3').textContent === media.Title) {
            return true;
        }
    }
    return false;
}

// Función para quitar un medio de la lista
function quitarDeLaLista(media) {
    let items = document.querySelector('#containerList').querySelectorAll('.media-item');
    items.forEach(item => {
        if (item.querySelector('h3').textContent === media.Title) {
            document.querySelector('#containerList').removeChild(item);
            Swal.fire({
                title: `${media.Title} eliminado`,
                text: `Eliminaste este título de tu lista con éxito`
            });
        }
    });
}