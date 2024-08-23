document.querySelector('.sign-out').addEventListener('click', function() {
    localStorage.removeItem('usuarioAutenticado');
    sessionStorage.removeItem('usuarioAutenticado');
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    const loginPath = `${window.location.origin}${basePath}/pages/login.html`;
    window.location.href = loginPath;
});