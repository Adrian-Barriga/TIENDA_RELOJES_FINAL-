document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    cargarDatosPerfil();
    setupFormSubmit();
});

async function cargarDatosPerfil() {
    try {
        toggleSpinner();
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await fetch('/api/usuarios/perfil', {
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Error al cargar los datos del perfil');
        }

        const usuario = await response.json();
        
        // Actualizar información del usuario
        document.getElementById('nombreUsuario').textContent = usuario.nombre;
        document.getElementById('correoUsuario').textContent = usuario.correo;
        
        // Llenar el formulario
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('correo').value = usuario.correo;

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

function setupFormSubmit() {
    const form = document.getElementById('perfilForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const datosPerfil = {
            nombre: document.getElementById('nombre').value
        };

        try {
            toggleSpinner();
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch('/api/usuarios/actualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(datosPerfil)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al actualizar el perfil');
            }

            showToast('Perfil actualizado exitosamente', 'success');
            
            // Actualizar nombre en la UI
            document.getElementById('nombreUsuario').textContent = datosPerfil.nombre;
            document.getElementById('userName').textContent = datosPerfil.nombre;

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'danger');
        } finally {
            toggleSpinner(false);
        }
    });
} 