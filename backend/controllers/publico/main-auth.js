function guardarSesionAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('usuario', JSON.stringify(user));
}

function limpiarSesionAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
}

function mostrarMensajeAuth(texto, tipo = 'error') {
    const box = document.getElementById('mensaje-auth') || document.getElementById('mensaje-login');
    if (!box) {
        alert(texto);
        return;
    }

    box.textContent = texto;
    box.className = `mensaje-auth ${tipo}`;
    box.style.display = 'block';
}

async function iniciarSesion(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
    }

    guardarSesionAuth(data.token, data.user);

    if (data.user.rol === 'admin') {
        window.location.href = '/admin/dashboard.html';
    } else {
        window.location.href = '/mi-cuenta.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form =
        document.querySelector('#form-login') ||
        document.querySelector('#form-auth') ||
        document.querySelector('form[data-auth="login"]');

    if (!form) return;

    const emailInput =
        form.querySelector('#email') ||
        form.querySelector('input[name="email"]') ||
        form.querySelector('input[type="email"]');

    const passwordInput =
        form.querySelector('#password') ||
        form.querySelector('input[name="password"]') ||
        form.querySelector('input[type="password"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                mostrarMensajeAuth('Completa el email y la contraseña');
                return;
            }

            await iniciarSesion(email, password);
        } catch (error) {
            console.error('Error en login:', error);
            mostrarMensajeAuth(error.message || 'Error al iniciar sesión');
        }
    });
});

window.cerrarSesion = function () {
    limpiarSesionAuth();
    window.location.href = '/index.html';
};


