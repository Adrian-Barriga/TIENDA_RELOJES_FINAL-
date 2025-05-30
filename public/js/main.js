// Funciones de utilidad
// Definir API_URL como variable global para compartirla entre archivos
window.API_URL = window.location.origin + '/api';

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

// Mostrar notificación
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
            <button type="button" class="btn-close btn-close-white float-end" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Mostrar/ocultar spinner de carga
function toggleSpinner(show = true) {
    const existingSpinner = document.querySelector('.spinner-overlay');
    if (show && !existingSpinner) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
        document.body.appendChild(spinner);
    } else if (!show && existingSpinner) {
        existingSpinner.remove();
    }
}

// Cargar productos destacados
async function loadFeaturedProducts() {
    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/productos`);
        const productos = await response.json();
        
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = productos
                .slice(0, 3)
                .map(producto => `
                    <div class="col-md-4">
                        <div class="card product-card">
                            <img src="${producto.imagen_url}" class="card-img-top" alt="${producto.nombre}">
                            <div class="card-body">
                                <h5 class="card-title">${producto.nombre}</h5>
                                <p class="card-text">${producto.descripcion}</p>
                                <p class="card-text"><strong>Precio: $${producto.precio}</strong></p>
                                <button onclick="addToCart(${producto.id})" class="btn btn-primary">
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showToast('Error al cargar los productos', 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Agregar al carrito
async function addToCart(productId) {
    if (!isAuthenticated()) {
        showToast('Debes iniciar sesión para agregar productos al carrito', 'warning');
        return;
    }

    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/carrito`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                id_producto: productId,
                cantidad: 1
            })
        });

        if (!response.ok) throw new Error('Error al agregar al carrito');
        
        showToast('Producto agregado al carrito');
        updateCartCounter();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al agregar el producto al carrito', 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Actualizar contador del carrito
async function updateCartCounter() {
    try {
        const token = localStorage.getItem('token');
        const cartCounterElement = document.getElementById('cartCounter');

        if (!token || !cartCounterElement) {
            if (cartCounterElement) {
                cartCounterElement.textContent = '0';
            }
            return;
        }

        const response = await fetch(`${API_URL}/carrito`, {
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el carrito');
        }

        const carrito = await response.json();
        const total = Array.isArray(carrito) ? carrito.reduce((sum, item) => sum + item.cantidad, 0) : 0;
        cartCounterElement.textContent = total.toString();
    } catch (error) {
        console.error('Error al actualizar contador:', error);
        const cartCounterElement = document.getElementById('cartCounter');
        if (cartCounterElement) {
            cartCounterElement.textContent = '0';
        }
    } finally {
        // Spinner handled by individual page scripts if needed
    }
}

// Verificar autenticación
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Actualizar UI según estado de autenticación
function updateAuthUI(userName = null) {
    const token = localStorage.getItem('token');
    const userDropdown = document.getElementById('userDropdown');
    const loginButton = document.getElementById('loginButton');
    const userNameDisplay = document.getElementById('userName');

    if (token) {
        userDropdown.style.display = 'block';
        loginButton.style.display = 'none';
        
        // Si tenemos el nombre de usuario, mostrarlo
        if (userNameDisplay && userName) {
            userNameDisplay.textContent = userName;
        }
    } else {
        userDropdown.style.display = 'none';
        loginButton.style.display = 'block';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    updateAuthUI();
    updateCartCounter();

    // Registrar navegación inicial
    registrarNavegacion(window.location.pathname, 'PAGE_LOAD');

    // Manejar cierre de sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            updateAuthUI();
            showToast('Sesión cerrada exitosamente');
            setTimeout(() => window.location.href = '/', 1000);
        });
    }

    // Registrar clics en enlaces
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            registrarNavegacion(link.href, 'CLICK', { text: link.textContent });
        }
    });
}); 