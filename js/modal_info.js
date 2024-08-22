// Función para actualizar el contenido del modal
function actualizarModal(media, posterPath) {
    document.getElementById('infomodalLabel').textContent = media.title || media.name;
    document.querySelector('#infomodal .modal-body img').src = posterPath;
    document.querySelector('#infomodal .modal-body img').alt = media.title || media.name;
    document.querySelector('#infomodal .modal-body .info').innerHTML = `
        <p><strong>Descripción:</strong> ${media.overview || 'No hay descripción disponible'}</p>
        <p><strong>Género:</strong> ${media.genre_ids.map(id => getGenreName(id)).join(', ')}</p>
        <p><strong>Duración:</strong> ${media.runtime ? `${media.runtime} minutos` : 'N/A'}</p>
        <p><strong>Fecha de lanzamiento:</strong> ${media.release_date || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${media.media_type === 'movie' ? 'Película' : 'Serie de TV'}</p>
    `;
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('infomodal'));
    modal.show();
}

// Función para obtener el nombre del género
function getGenreName(genreId) {
    const genreMap = {
        28: 'Acción',
        12: 'Aventura',
        16: 'Animación',
        35: 'Comedia',
        80: 'Crimen',
        99: 'Documental',
        18: 'Drama',
        10751: 'Familiar',
        14: 'Fantasía',
        36: 'Historia',
        27: 'Terror',
        10402: 'Música',
        9648: 'Misterio',
        10749: 'Romance',
        878: 'Ciencia Ficción',
        10770: 'Película para TV',
        53: 'Suspense',
        10752: 'Guerra',
        37: 'Western'
    };
    return genreMap[genreId] || 'Desconocido';
}