document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');

    if (!usuarioAutenticado) {
        window.location.href = './pages/login.html';
    }
});

document.querySelector('.sign-out').addEventListener('click', function() {
    localStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioAutenticado');
    window.location.href = '../pages/login.html';
});

class Media {
    constructor(titulo, descripcion, tipo, generos = []) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.image = `./assets/${tipo.toLowerCase()}s/${titulo.toLowerCase().replace(/ /g, '_')}.jpg`;
        this.tipo = tipo;
        this.genero = generos;
    }
}

let multimedia = [
    new Media('Damsel', 'Elodie, una hija obediente, acepta casarse con un príncipe para salvar a su pueblo, pero su boda da un giro estremecedor y ahora debe encontrar la forma de salvarse a sí misma.', 'pelicula', ['accion', 'aventura', 'fantasia']),
    new Media('Outerbanks', '', 'serie', ['accion', 'aventura', 'fantasia']),
    new Media('Atlas', '', 'pelicula', ['accion', 'aventura', 'fantasia']),
    new Media('Bridgerton', '', 'serie', ['accion', 'aventura', 'fantasia']),
    new Media('Un asunto familiar', '', 'pelicula', ['accion', 'aventura', 'fantasia']),
    new Media('Stranger things', '', 'serie', ['accion', 'aventura', 'fantasia']),
]

let containerSlides = document.querySelector('.carousel-inner');
let containerMedia = document.querySelector('#containerMedia');
let containerList = document.querySelector('#containerList');
let templateMedia = document.querySelector('.template-media').content;

multimedia.slice(-3).forEach((media, index) => {
    let copiaSlides = document.querySelector('.template-slide').content.cloneNode(true);
    copiaSlides.querySelector('h2').textContent = media.titulo;
    copiaSlides.querySelector('p').textContent = media.descripcion;
    copiaSlides.querySelector('img').src = media.image;

    // Establecer la primera diapositiva como activa
    if (index === 0) {
        copiaSlides.querySelector('.carousel-item').classList.add('active');
    }

    containerSlides.appendChild(copiaSlides);
});

multimedia.forEach((media) => {
    let copiaMedia = document.querySelector('.template-media').content.cloneNode(true);
    copiaMedia.querySelector('h3').textContent = media.titulo;
    copiaMedia.querySelector('p').textContent = media.genero.join(', ');
    copiaMedia.querySelector('img').src = media.image;
    copiaMedia.querySelector('img').alt = media.titulo;
    let agregarLista = copiaMedia.querySelector('.agregar-lista');

    agregarLista.addEventListener('click', () => {
        agregarALaLista(media);
    });

    containerMedia.append(copiaMedia);
});

function agregarALaLista(media) {
    // Verificar si el medio ya está en la lista
    if (estaEnLaLista(media)) {
        Swal.fire({
            title: `${media.titulo} ya esta en tu lista`,
            icon: "info"
        });
        return;
    }

    let copiaLista = templateMedia.cloneNode(true);

    copiaLista.querySelector('h3').textContent = media.titulo;
    copiaLista.querySelector('p').textContent = media.genero.join(', ');
    copiaLista.querySelector('img').src = media.image;

    copiaLista.querySelector('.agregar-lista').classList.add('quitar-lista');
    let quitarLista = copiaLista.querySelector('.quitar-lista');
    quitarLista.classList.remove('agregar-lista');
    quitarLista.querySelector('.fa-plus').classList.add('fa-xmark');
    quitarLista.querySelector('.fa-xmark').classList.remove('fa-plus');

    Swal.fire({
        title: `${media.titulo} Agregado`,
        text: `¡Agregaste este titulo a tu lista con exito!`,
        icon: "success"
    });

    quitarLista.addEventListener('click', () => {
        quitarDeLaLista(media);
    });

    containerList.append(copiaLista);
}

function estaEnLaLista(media) {
    let items = containerList.querySelectorAll('.media-item');
    for (let item of items) {
        if (item.querySelector('h3').textContent === media.titulo) {
            return true;
        }
    }
    return false;
}

function quitarDeLaLista(media) {
    let items = containerList.querySelectorAll('.media-item');
    items.forEach(item => {
        if (item.querySelector('h3').textContent === media.titulo) {
            containerList.removeChild(item);
            Swal.fire({
                title: `${media.titulo} eliminado`,
                text: `Eliminaste este titulo de tu lista con exito`
            });
        }
    });
}