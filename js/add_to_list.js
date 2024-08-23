export function agregarALaLista(media) {
    if (estaEnLaLista(media)) {
        Swal.fire({
            title: `${media.title || media.name} ya está en tu lista`,
            icon: "info"
        });
        return;
    }

    Swal.fire({
        title: `${media.title || media.name} Agregado`,
        text: `¡Agregaste este título a tu lista con éxito!`,
        icon: "success"
    });

    guardarEnLocalStorage(media);
}

function estaEnLaLista(media) {
    const mediaTitleOrName = media.title || media.name;
    const mediaList = JSON.parse(localStorage.getItem('mediaList')) || [];

    // Buscar si el elemento ya está en la lista de localStorage
    const encontrado = mediaList.some(item => {
        const itemTitleOrName = item.title || item.name;
        return itemTitleOrName === mediaTitleOrName;
    });

    return encontrado;
}

function guardarEnLocalStorage(media) {
    let lista = JSON.parse(localStorage.getItem('mediaList')) || [];
    lista.push(media);
    localStorage.setItem('mediaList', JSON.stringify(lista));
}
