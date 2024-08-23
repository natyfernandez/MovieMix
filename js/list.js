document.addEventListener('DOMContentLoaded', () => {
    const mediaList = JSON.parse(localStorage.getItem('mediaList')) || [];
    const containerList = document.querySelector('#containerList');

    if (mediaList.length > 0) {
        mediaList.forEach(media => renderizarLista(media));
    } else {
        containerList.innerHTML = '<p>No hay elementos en la lista</p>';
    }
});

function renderizarLista(media) {
    const containerList = document.querySelector('#containerList');
    const templateMedia = document.querySelector('.template-media').content;
    const mediaItem = templateMedia.cloneNode(true);

    // Agregar un identificador único al elemento
    mediaItem.querySelector('.media-item').setAttribute('data-id', media.title || media.name);

    mediaItem.querySelector('h3').textContent = media.title || media.name;
    mediaItem.querySelector('p').textContent = media.release_date;

    const highResPoster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default_image.jpg';
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
}

export function quitarDeLaLista(media) {
    const containerList = document.querySelector('#containerList');
    const mediaItems = containerList.querySelectorAll('.media-item');

    mediaItems.forEach(item => {
        // Comparar el data-id con el título o nombre del media
        if (item.getAttribute('data-id') === (media.title || media.name)) {
            if (containerList.contains(item)) { 
                containerList.removeChild(item); 
                Swal.fire({
                    title: `${media.title || media.name} eliminado`,
                    text: `Eliminaste este título de tu lista con éxito`,
                    icon: "success"
                });
                eliminarDeLocalStorage(media.title || media.name); 
            }
        }
    });
}

function eliminarDeLocalStorage(mediaTitleOrName) {
    // Obtener la lista de medios desde el localStorage
    let mediaList = JSON.parse(localStorage.getItem('mediaList')) || [];

    mediaList = mediaList.filter(media => media.title !== mediaTitleOrName && media.name !== mediaTitleOrName);

    // Actualizar lista en el localStorage
    localStorage.setItem('mediaList', JSON.stringify(mediaList));
}
