import { loadMediaSection } from './load_media.js';

document.addEventListener('DOMContentLoaded', function() {
    let usuarioAutenticado = localStorage.getItem('usuarioAutenticado') || sessionStorage.getItem('usuarioAutenticado');
    
    if (!usuarioAutenticado) {
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        const loginPath = `${window.location.origin}${basePath}/pages/login.html`;
        window.location.href = loginPath;
    } else {
        loadMediaSection('Crimen', '#containerMediaCrimen', 'tv');
        loadMediaSection('Romance', '#containerMediaRomance', 'tv');
        loadMediaSection('Comedia', '#containerMediaComedia', 'tv');
        loadMediaSection('Ciencia Ficción', '#containerMediaFiccion', 'tv');
    }
});

