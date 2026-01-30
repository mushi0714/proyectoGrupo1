// === VARIABLES GLOBALES ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const loginModal = document.getElementById('login-modal');
const btnLogin = document.querySelector('.btn-login');
const closeModal = document.querySelector('.close-modal');
const formLogin = document.getElementById('form-login');
const formPostulacion = document.getElementById('form-postulacion');
const formSuscripcion = document.getElementById('form-suscripcion');
const formConsultaResultado = document.getElementById('form-consulta-resultado');
const resultadoMensaje = document.getElementById('resultado-mensaje');
const adminPanel = document.getElementById('admin-panel');
const cerrarSesion = document.getElementById('cerrar-sesion');
const tablaPostulantes = document.getElementById('tabla-postulantes')?.querySelector('tbody'); // Correción: Operador de encadenamiento opcional
const tablaSuscriptores = document.getElementById('tabla-suscriptores')?.querySelector('tbody'); // Correción: Operador de encadenamiento opcional
const btnActualizarEstados = document.getElementById('actualizar-estados');

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos desde LocalStorage al iniciar
    inicializarDatos();
    // Verificar si la sesión de admin está activa
    verificarSesionAdmin();
    // Actualizar tablas del panel admin si es necesario
    if (localStorage.getItem('adminSesionActiva') === 'true') {
        cargarTablaPostulantes();
        cargarTablaSuscriptores();
    }
    // Asignar evento de teclado al menú responsive (mejora de accesibilidad)
    asignarEventosAccesibilidad();
});

// === FUNCIONES DE LOCALSTORAGE ===
// Inicializar estructuras de datos si no existen
function inicializarDatos() {
    if (!localStorage.getItem('postulantes')) {
        localStorage.setItem('postulantes', JSON.stringify([]));
    }
    if (!localStorage.getItem('suscriptores')) {
        localStorage.setItem('suscriptores', JSON.stringify([]));
    }
    if (!localStorage.getItem('adminSesionActiva')) { // Correción: Inicializar estado de sesión si no existe
        localStorage.setItem('adminSesionActiva', 'false');
    }
}

// Guardar postulante en LocalStorage
function guardarPostulante(postulante) {
    try { // Correción: Manejo de errores en LocalStorage
        const postulantes = JSON.parse(localStorage.getItem('postulantes') || '[]');
        postulantes.push(postulante);
        localStorage.setItem('postulantes', JSON.stringify(postulantes));
    } catch (error) {
        console.error('Error al guardar postulante:', error);
        alert('Ocurrió un error al guardar la postulación. Inténtalo nuevamente.');
    }
}

// Guardar suscriptor en LocalStorage
function guardarSuscriptor(suscriptor) {
    try { // Correción: Manejo de errores en LocalStorage
        const suscriptores = JSON.parse(localStorage.getItem('suscriptores') || '[]');
        suscriptores.push(suscriptor);
        localStorage.setItem('suscriptores', JSON.stringify(suscriptores));
    } catch (error) {
        console.error('Error al guardar suscriptor:', error);
        alert('Ocurrió un error al suscribirte. Inténtalo nuevamente.');
    }
}

// Actualizar estado de postulantes
function actualizarEstadosPostulantes() {
    try {
        const postulantes = JSON.parse(localStorage.getItem('postulantes') || '[]');
        const estados = ['Aprobado', 'Rechazado', 'En Evaluación'];
        const postulantesActualizados = postulantes.map(p => ({
            ...p,
            estado: estados[Math.floor(Math.random() * estados.length)]
        }));
        localStorage.setItem('postulantes', JSON.stringify(postulantesActualizados));
        return postulantesActualizados;
    } catch (error) {
        console.error('Error al actualizar estados:', error);
        alert('Ocurrió un error al actualizar los estados. Inténtalo nuevamente.');
        return [];
    }
}

// === FUNCIONES DE NAVEGACIÓN Y MODALES ===
// Menú responsive
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Correción: Actualizar atributo aria-expanded para accesibilidad
    const isActive = navLinks.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isActive);
});

// Abrir modal de login
btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('hidden');
    // Correción: Enfocar el primer campo del formulario al abrir el modal
    formLogin.querySelector('input[name="usuario"]').focus();
});

// Cerrar modal de login
closeModal.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
});

// Correción: Cerrar modal con tecla Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !loginModal.classList.contains('hidden')) {
        loginModal.classList.add('hidden');
    }
});

// === FUNCIONALIDAD DE INICIO DE SESIÓN ADMIN ===
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = e.target.usuario.value.trim();
    const contraseña = e.target.contraseña.value.trim();

    // Credenciales del creador
    if (usuario === 'admin_becas' && contraseña === 'B3c4s_2026*') {
        localStorage.setItem('adminSesionActiva', 'true');
        loginModal.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        cargarTablaPostulantes();
        cargarTablaSuscriptores();
        alert('¡Inicio de sesión exitoso! Panel de administrador activado.');
    } else {
        alert('Usuario o contraseña incorrectos.');
        // Correción: Limpiar campo de contraseña en caso de error
        e.target.contraseña.value = '';
        e.target.usuario.focus();
    }
    formLogin.reset();
});

// Verificar sesión admin al cargar la página
function verificarSesionAdmin() {
    if (localStorage.getItem('adminSesionActiva') === 'true') {
        adminPanel?.classList.remove('hidden'); // Correción: Operador de encadenamiento opcional
    }
}

// Cerrar sesión admin
cerrarSesion.addEventListener('click', () => {
    localStorage.setItem('adminSesionActiva', 'false');
    adminPanel?.classList.add('hidden'); // Correción: Operador de encadenamiento opcional
    alert('Sesión cerrada correctamente.');
});

// === FUNCIONALIDAD DE POSTULACIÓN ===
formPostulacion.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevoPostulante = {
        nombre: e.target.nombre.value.trim(),
        cedula: e.target.cedula.value.trim(),
        email: e.target.email.value.trim(),
        carrera: e.target.carrera.value,
        motivacion: e.target.motivacion.value.trim(),
        estado: 'En Evaluación' // Estado inicial por defecto
    };

    // Validar que no exista una postulación con la misma cédula
    const postulantesExistentes = JSON.parse(localStorage.getItem('postulantes') || '[]');
    const cedulaDuplicada = postulantesExistentes.some(p => p.cedula === nuevoPostulante.cedula);

    if (cedulaDuplicada) {
        alert('Ya existe una postulación registrada con esta cédula.');
        return;
    }

    // Correción: Validar formato de correo electrónico
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoPostulante.email);
    if (!emailValido) {
        alert('Por favor, ingresa un correo electrónico válido.');
        e.target.email.focus();
        return;
    }

    // Correción: Validar que la cédula solo contenga números
    const cedulaValida = /^[0-9]+$/.test(nuevoPostulante.cedula);
    if (!cedulaValida) {
        alert('La cédula solo debe contener números.');
        e.target.cedula.focus();
        return;
    }

    guardarPostulante(nuevoPostulante);
    formPostulacion.reset();
    alert(`¡Postulación enviada exitosamente, ${nuevoPostulante.nombre}! Podrás consultar el resultado a partir del 30/05/2026.`);

    // Actualizar tabla admin si está visible
    if (localStorage.getItem('adminSesionActiva') === 'true') {
        cargarTablaPostulantes();
    }
});

// === FUNCIONALIDAD DE SUSCRIPCIÓN ===
formSuscripcion.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevoSuscriptor = {
        nombre: e.target['sus-nombre'].value.trim(),
        email: e.target['sus-email'].value.trim()
    };

    // Validar que no exista el suscriptor
    const suscriptoresExistentes = JSON.parse(localStorage.getItem('suscriptores') || '[]');
    const emailDuplicado = suscriptoresExistentes.some(s => s.email === nuevoSuscriptor.email);

    if (emailDuplicado) {
        alert('Ya estás suscrito a nuestro boletín.');
        return;
    }

    // Correción: Validar formato de correo electrónico
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoSuscriptor.email);
    if (!emailValido) {
        alert('Por favor, ingresa un correo electrónico válido.');
        e.target['sus-email'].focus();
        return;
    }

    guardarSuscriptor(nuevoSuscriptor);
    formSuscripcion.reset();
    alert(`¡Gracias por suscribirte, ${nuevoSuscriptor.nombre}! Recibirás actualizaciones en tu correo.`);

    // Actualizar tabla admin si está visible
    if (localStorage.getItem('adminSesionActiva') === 'true') {
        cargarTablaSuscriptores();
    }
});

// === FUNCIONALIDAD DE CONSULTA DE RESULTADOS ===
formConsultaResultado.addEventListener('submit', (e) => {
    e.preventDefault();
    const cedulaConsulta = e.target['cons-cedula'].value.trim();

    // Correción: Validar que la cédula solo contenga números
    const cedulaValida = /^[0-9]+$/.test(cedulaConsulta);
    if (!cedulaValida) {
        alert('La cédula solo debe contener números.');
        e.target['cons-cedula'].focus();
        return;
    }

    const postulantes = JSON.parse(localStorage.getItem('postulantes') || '[]');
    const postulanteEncontrado = postulantes.find(p => p.cedula === cedulaConsulta);

    resultadoMensaje.classList.remove('hidden');

    if (postulanteEncontrado) {
        const colorEstado = postulanteEncontrado.estado === 'Aprobado' ? '#2E8BC0' : postulanteEncontrado.estado === 'Rechazado' ? '#D9534F' : '#F0AD4E';
        resultadoMensaje.innerHTML = `
            <h4>Resultado para ${postulanteEncontrado.nombre}</h4>
            <p><strong>Carrera:</strong> ${postulanteEncontrado.carrera}</p>
            <p><strong>Estado:</strong> <span style="color: ${colorEstado}; font-weight: bold;">${postulanteEncontrado.estado}</span></p>
            ${postulanteEncontrado.estado === 'Aprobado' ? '<p><em>Se te enviará un correo con los pasos para activar la beca.</em></p>' : ''}
        `;
    } else {
        resultadoMensaje.innerHTML = `
            <p style="color: #D9534F; font-weight: bold;">No se encontró ninguna postulación con esta cédula.</p>
            <p>Asegúrate de haber completado el formulario de postulación correctamente.</p>
        `;
    }
    formConsultaResultado.reset();
});

// === FUNCIONES DEL PANEL DE ADMINISTRADOR ===
// Cargar tabla de postulantes
function cargarTablaPostulantes() {
    if (!tablaPostulantes) return; // Correción: Evitar errores si la tabla no existe
    const postulantes = JSON.parse(localStorage.getItem('postulantes') || '[]');
    tablaPostulantes.innerHTML = '';

    if (postulantes.length === 0) {
        tablaPostulantes.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay postulantes registrados.</td></tr>';
        return;
    }

    postulantes.forEach(post => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${post.nombre}</td>
            <td>${post.cedula}</td>
            <td>${post.carrera}</td>
            <td>${post.email}</td>
            <td style="color: ${post.estado === 'Aprobado' ? '#2E8BC0' : post.estado === 'Rechazado' ? '#D9534F' : '#F0AD4E'}">${post.estado}</td>
        `;
        tablaPostulantes.appendChild(fila);
    });
}

// Cargar tabla de suscriptores
function cargarTablaSuscriptores() {
    if (!tablaSuscriptores) return; // Correción: Evitar errores si la tabla no existe
    const suscriptores = JSON.parse(localStorage.getItem('suscriptores') || '[]');
    tablaSuscriptores.innerHTML = '';

    if (suscriptores.length === 0) {
        tablaSuscriptores.innerHTML = '<tr><td colspan="2" style="text-align: center;">No hay suscriptores registrados.</td></tr>';
        return;
    }

    suscriptores.forEach(sus => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${sus.nombre}</td>
            <td>${sus.email}</td>
        `;
        tablaSuscriptores.appendChild(fila);
    });
}

// Actualizar estados de postulantes aleatoriamente
btnActualizarEstados?.addEventListener('click', () => { // Correción: Operador de encadenamiento opcional
    actualizarEstadosPostulantes();
    cargarTablaPostulantes();
    alert('Estados de postulantes actualizados correctamente.');
});

// === FUNCIONES DE ACCESIBILIDAD ===
function asignarEventosAccesibilidad() {
    // Abrir/cerrar menú con tecla Enter o Espacio
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isActive);
        }
    });

    // Cerrar menú al seleccionar un enlace en móvil
    navLinks.querySelectorAll('a').forEach(enlace => {
        enlace.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// === ESTILOS RESPONSIVOS DINÁMICOS ===
document.head.insertAdjacentHTML(
    'beforeend',
    `
  <style>
    @media (max-width: 768px) {
      .nav-links {
        position: absolute;
        top: 65px;
        left: 0;
        width: 100%;
        background-color: var(--azul-profundo);
        flex-direction: column;
        padding: 20px 0;
        display: none;
      }

      .nav-links.active {
        display: flex;
      }

      .nav-links li {
        margin: 10px 25px;
        text-align: left;
      }

      .menu-toggle {
        display: block;
      }

      .hero-content h1 {
        font-size: 2rem;
      }

      .form-row {
        flex-direction: column;
      }

      .admin-header {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
  `
);
