document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    const form = document.getElementById('actualizarPasswordForm');
    const correoInput = document.getElementById('correo');
    
    // Obtener el correo del usuario autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('No hay token de autenticación', 'danger');
        return;
    }

    fetch('/api/usuarios/perfil', {
        headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.mensaje || 'Error al cargar los datos del usuario');
            });
        }
        return response.json();
    })
    .then(usuario => {
        correoInput.value = usuario.correo;
        correoInput.readOnly = true;
    })
    .catch(error => {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const correo = document.getElementById('correo').value;
        const passwordActual = document.getElementById('passwordActual').value;
        const passwordNueva = document.getElementById('passwordNueva').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;

        // Validar que las contraseñas coincidan
        if (passwordNueva !== confirmarPassword) {
            showToast('Las contraseñas no coinciden', 'danger');
            return;
        }

        // Validar longitud mínima de la contraseña
        if (passwordNueva.length < 8) {
            showToast('La nueva contraseña debe tener al menos 8 caracteres', 'danger');
            return;
        }

        try {
            toggleSpinner();
            const response = await fetch('/api/usuarios/actualizar-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    correo,
                    passwordActual,
                    passwordNueva
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Error al actualizar la contraseña');
            }

            showToast('Contraseña actualizada exitosamente', 'success');
            
            // Limpiar el formulario
            form.reset();
            correoInput.value = correo; // Restaurar el correo después de limpiar
            
            // Redirigir al perfil después de 2 segundos
            setTimeout(() => {
                window.location.href = '/perfil.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'danger');
        } finally {
            toggleSpinner(false);
        }
    });
}); 