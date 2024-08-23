document.getElementById('form-registro').addEventListener('submit', function (event) {
    event.preventDefault();
    let nombre = document.getElementById('nombre-registro').value;
    let apellido = document.getElementById('apellido-registro').value;
    let email = document.getElementById('email-registro').value;
    let contrasena = document.getElementById('contrasena-registro').value;

    // Verificar si el usuario ya existe
    if (localStorage.getItem(email)) {
        Swal.fire({
            title: `El usuario ya existe.`,
            icon: "info"
        });
    } else {
        // Guardar el usuario en Local Storage
        localStorage.setItem(email, JSON.stringify({ nombre, apellido, contrasena }));
        Swal.fire({
            title: `Usuario registrado correctamente`,
            icon: "sucess"
        });
    }
});

document.getElementById('form-iniciar').addEventListener('submit', function (event) {
    event.preventDefault();
    let email = document.getElementById('email').value;
    let contrasena = document.getElementById('contrasena').value;
    let rememberMe = document.querySelector('.remember-me').checked;

    let usuario = localStorage.getItem(email);

    if (usuario) {
        let { contrasena: storedPassword } = JSON.parse(usuario);
        if (storedPassword === contrasena) {
            if (rememberMe) {
                localStorage.setItem('usuarioAutenticado', email);
            } else {
                sessionStorage.setItem('usuarioAutenticado', email);
            }
            window.location.href = './../index.html';
        } else {
            Swal.fire({
                title: `Contraseña incorrecta.`,
                text: `Intenta de nuevo`,
                icon: "error"
            });
        }
    } else {
        Swal.fire({
            title: `Usuario no encontrado.`,
            text: `Intenta de nuevo`,
            icon: "error"
        });
    }
});

const forms = {
    registro: document.getElementById('registro'),
    sesion: document.getElementById('sesion')
};

const showForm = (formId) => {
    Object.values(forms).forEach(form => form.classList.remove('active'));
    forms[formId].classList.add('active');
};

const hash = window.location.hash.replace('#', '');
if (hash && forms[hash]) {
    showForm(hash);
} else {
    showForm('sesion');
}

document.querySelectorAll('.switch-form').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('data-target');
        showForm(targetId);
        window.history.replaceState(null, null, `#${targetId}`);
    });
});




