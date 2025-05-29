// Verificar si el usuario está autenticado y es administrador
async function verificarAdmin() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/verificar', {
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const data = await response.json();
        if (data.usuario.rol !== 'administrador') {
            window.location.href = '/';
        }
        // Guardar el ID del usuario actual
        localStorage.setItem('userId', data.usuario.id);
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login.html';
    }
}

// Cargar usuarios
async function cargarUsuarios() {
    try {
        toggleSpinner();
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/usuarios', {
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const usuarios = await response.json();
        const tbody = document.getElementById('usuariosTableBody');
        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.rol}</td>
                <td>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                            ${usuario.estado === 'activo' ? 'checked' : ''}
                            onchange="cambiarEstado(${usuario.id}, this.checked)"
                            ${usuario.id === parseInt(localStorage.getItem('userId')) ? 'disabled' : ''}>
                        <label class="form-check-label">
                            ${usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </label>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar usuarios', 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Cambiar estado del usuario
async function cambiarEstado(id, activo) {
    try {
        toggleSpinner();
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await fetch(`/api/auth/usuarios/${id}/estado`, {
            method: 'PUT',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: activo ? 'activo' : 'inactivo'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al cambiar el estado');
        }

        showToast('Estado actualizado exitosamente');
        await cargarUsuarios(); // Recargar la lista de usuarios
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
        await cargarUsuarios(); // Recargar para restaurar el estado anterior
    } finally {
        toggleSpinner(false);
    }
}

// Crear nuevo usuario
async function crearUsuario() {
    const form = document.getElementById('crearUsuarioForm');
    const formData = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value
    };

    try {
        toggleSpinner();
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/crear-usuario', {
            method: 'POST',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al crear usuario');
        }

        showToast('Usuario creado exitosamente');
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('crearUsuarioModal')).hide();
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }

    try {
        toggleSpinner();
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/auth/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al eliminar usuario');
        }

        showToast('Usuario eliminado exitosamente');
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    cargarUsuarios();
    // Asegurarse de que el formulario de crear usuario existe antes de añadir el listener
    const crearUsuarioForm = document.getElementById('crearUsuarioForm');
    if (crearUsuarioForm) {
        crearUsuarioForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el envío por defecto
            crearUsuario();
        });
    }
    // Asegurarse de que el botón de cerrar sesión existe antes de añadir el listener
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}); 