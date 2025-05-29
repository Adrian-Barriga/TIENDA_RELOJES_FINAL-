// Validar fecha de tarjeta
function validarFechaTarjeta(mes, anio) {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
    const anioActual = fechaActual.getFullYear() % 100; // Obtener últimos 2 dígitos

    // Convertir a números
    mes = parseInt(mes);
    anio = parseInt(anio);

    // Validar rango de mes
    if (mes < 1 || mes > 12) {
        return false;
    }

    // Validar que la fecha no sea anterior a la actual
    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
        return false;
    }

    return true;
}

// Procesar pago
async function procesarPago(event) {
    event.preventDefault();

    const mes = document.getElementById('mesExpiracion').value;
    const anio = document.getElementById('anioExpiracion').value;

    if (!validarFechaTarjeta(mes, anio)) {
        showToast('La fecha de expiración de la tarjeta no es válida', 'danger');
        return;
    }

    try {
        toggleSpinner();
        const response = await fetch(`${API_URL}/pagos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                // Otros datos del pago
            })
        });

        if (!response.ok) {
            throw new Error('Error al procesar el pago');
        }

        showToast('Pago procesado exitosamente');
        setTimeout(() => window.location.href = '/', 1000);
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'danger');
    } finally {
        toggleSpinner(false);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const formPago = document.getElementById('formPago');
    if (formPago) {
        formPago.addEventListener('submit', procesarPago);
    }
}); 