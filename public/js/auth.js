// Funciones de autenticación
// Usamos la variable global API_URL definida en main.js

// Registro de usuario
async function register(event) {
    event.preventDefault();
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value
    };

    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error en el registro');
        }

        localStorage.setItem('token', data.token);
        showToast('Registro exitoso');
        setTimeout(() => window.location.href = '/', 1000);
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Inicio de sesión
async function login(event) {
    event.preventDefault();
    
    const formData = {
        correo: document.getElementById('correo').value,
        password: document.getElementById('password').value
    };

    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error en el inicio de sesión');
        }

        localStorage.setItem('token', data.token);
        showToast('Inicio de sesión exitoso');
        setTimeout(() => window.location.href = '/', 1000);
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Verificar autenticación
async function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const adminPanel = document.getElementById('adminPanel');
    const userName = document.getElementById('userName');

    if (token) {
        try {
            const response = await fetch('/api/auth/verificar', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Actualizar elementos solo si existen
                if (userName) userName.textContent = data.usuario.nombre;
                if (userDropdown) userDropdown.style.display = 'block';
                if (loginButton) loginButton.style.display = 'none';

                // Mostrar panel de administración si el usuario es administrador
                if (data.usuario.rol === 'administrador' && adminPanel) {
                    adminPanel.style.display = 'block';
                }

                return data.usuario;
            } else {
                throw new Error('Token inválido');
            }
        } catch (error) {
            console.error('Error:', error);
            localStorage.removeItem('token');
            if (userDropdown) userDropdown.style.display = 'none';
            if (loginButton) loginButton.style.display = 'block';
            if (adminPanel) adminPanel.style.display = 'none';
            return null;
        }
    } else {
        if (userDropdown) userDropdown.style.display = 'none';
        if (loginButton) loginButton.style.display = 'block';
        if (adminPanel) adminPanel.style.display = 'none';
        return null;
    }
}

// Event Listeners para formularios
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }

    // Verificar autenticación al cargar la página
    verificarAutenticacion();
}); 