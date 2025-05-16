// Verificar si el usuario está autenticado y es administrador
async function verificarAdmin() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/verificar', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const data = await response.json();
        if (data.usuario.rol !== 'administrador') {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'login.html';
    }
}

// Cargar lista de usuarios
async function cargarUsuarios() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/auth/usuarios', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const usuarios = await response.json();
        const tablaUsuarios = document.getElementById('tablaUsuarios');
        tablaUsuarios.innerHTML = '';

        usuarios.forEach(usuario => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.rol}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarUsuario(${usuario.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tablaUsuarios.appendChild(fila);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la lista de usuarios');
    }
}

// Crear nuevo usuario
async function crearUsuario(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    const usuario = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value
    };

    try {
        const response = await fetch('/api/auth/crear-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            throw new Error('Error al crear usuario');
        }

        const data = await response.json();
        alert('Usuario creado exitosamente');
        document.getElementById('formCrearUsuario').reset();
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el usuario');
    }
}

// Editar usuario
async function editarUsuario(id) {
    const token = localStorage.getItem('token');
    try {
        // Obtener datos del usuario
        const response = await fetch(`/api/auth/usuarios/${id}`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener datos del usuario');
        }

        const usuario = await response.json();
        
        // Llenar el formulario con los datos del usuario
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('correo').value = usuario.correo;
        document.getElementById('rol').value = usuario.rol;
        document.getElementById('password').value = ''; // Dejar en blanco para no cambiar la contraseña

        // Cambiar el botón de submit para actualizar
        const submitBtn = document.querySelector('#formCrearUsuario button[type="submit"]');
        submitBtn.textContent = 'Actualizar Usuario';
        submitBtn.onclick = (e) => actualizarUsuario(e, id);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del usuario');
    }
}

// Actualizar usuario
async function actualizarUsuario(event, id) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    const usuario = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
    };

    // Solo incluir password si se ha modificado
    const password = document.getElementById('password').value;
    if (password) {
        usuario.password = password;
    }

    try {
        const response = await fetch(`/api/auth/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar usuario');
        }

        alert('Usuario actualizado exitosamente');
        document.getElementById('formCrearUsuario').reset();
        
        // Restaurar el botón de submit para crear
        const submitBtn = document.querySelector('#formCrearUsuario button[type="submit"]');
        submitBtn.textContent = 'Crear Usuario';
        submitBtn.onclick = crearUsuario;
        
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el usuario');
    }
}

// Eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/auth/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar usuario');
        }

        alert('Usuario eliminado exitosamente');
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario');
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
    document.getElementById('formCrearUsuario').addEventListener('submit', crearUsuario);
    document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
}); 