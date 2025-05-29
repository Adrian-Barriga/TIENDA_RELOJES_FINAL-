// Cargar historial de navegación
async function cargarHistorial() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/historial`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar el historial');
        }

        const historial = await response.json();
        const tabla = document.getElementById('historialTable');
        
        if (historial.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No hay registros de navegación</td>
                </tr>
            `;
            return;
        }

        tabla.innerHTML = historial.map(item => {
            const fecha = new Date(item.fecha).toLocaleString();
            const pagina = item.pagina.replace(/^\//, '').replace('.html', '') || 'Inicio';
            const accion = item.accion || '-';
            const detalles = item.detalles ? JSON.stringify(item.detalles, null, 2) : '-';

            return `
                <tr>
                    <td>${fecha}</td>
                    <td>${pagina}</td>
                    <td>${accion}</td>
                    <td><pre class="mb-0">${detalles}</pre></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar el historial', 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Registrar navegación
async function registrarNavegacion(pagina, accion = null, detalles = null) {
    if (!isAuthenticated()) return;

    try {
        await fetch(`${API_URL}/historial`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ pagina, accion, detalles })
        });
    } catch (error) {
        console.error('Error al registrar navegación:', error);
    }
}

// Cargar historial al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/historial.html') {
        cargarHistorial();
    }
}); 