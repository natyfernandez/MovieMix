function loadUserList() {
    const lista = JSON.parse(localStorage.getItem('listaMedia')) || [];
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