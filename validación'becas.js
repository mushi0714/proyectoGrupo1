// Obtener el formulario y elementos
const formulario = document.getElementById('scholarshipForm');
const mensajeExito = document.getElementById('successMessage');

// Función para mostrar errores
function mostrarError(idElemento, mensaje) {
    const elementoError = document.getElementById(`error${idElemento}`);
    elementoError.textContent = mensaje;
}

// Función para limpiar errores
function limpiarErrores() {
    const errores = document.querySelectorAll('.error-message');
    errores.forEach(error => error.textContent = '');
}

// Validación del formulario
formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    limpiarErrores();
    let esValido = true;

    // Validar nombres y apellidos
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    if (nombre.length < 2) {
        mostrarError('nombre', 'Los nombres deben tener al menos 2 caracteres');
        esValido = false;
    }
    if (apellido.length < 2) {
        mostrarError('apellido', 'Los apellidos deben tener al menos 2 caracteres');
        esValido = false;
    }

    // Validar correo electrónico
    const correo = document.getElementById('correo').value.trim();
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        mostrarError('correo', 'Ingrese un correo electrónico válido');
        esValido = false;
    }

    // Validar celular
    const celular = document.getElementById('celular').value.trim();
    if (celular.length < 7) {
        mostrarError('celular', 'El número de celular debe tener al menos 7 dígitos');
        esValido = false;
    }

    // Validar promedio académico
    const promedio = document.getElementById('promedio').value;
    if (promedio < 0 || promedio > 100) {
        mostrarError('promedio', 'El promedio debe estar entre 0 y 100');
        esValido = false;
    }

    // Validar descripción socioeconómica
    const descripcion = document.getElementById('descripcionHogar').value.trim();
    if (descripcion.length < 50) {
        mostrarError('descripcionHogar', 'La descripción debe tener al menos 50 caracteres');
        esValido = false;
    }

    // Si es válido, mostrar mensaje y reiniciar formulario
    if (esValido) {
        formulario.reset();
        mensajeExito.style.display = 'block';
        // Ocultar mensaje después de 8 segundos
        setTimeout(() => {
            mensajeExito.style.display = 'none';
        }, 8000);
}
})