/**
 * SISTEMA DE GESTIÓN DE BECAS (SGB) - Lógica Principal
 * Enfoque: Camino A (JS Puro, LocalStorage, DOM)
 */

const App = (() => {
    // --- ESTADO Y PERSISTENCIA DE DATOS ---
    
    // Inicialización de datos en LocalStorage si no existen
    const initData = () => {
        if (!localStorage.getItem('sgb_users')) {
            const initialUsers = [
                // Usuario Admin por defecto
                { id: 1, name: "Admin", email: "admin@sgb.com", pass: "123", role: "admin" },
                // Usuario Evaluador por defecto
                { id: 2, name: "Evaluador Jefe", email: "eval@sgb.com", pass: "123", role: "evaluator" },
                // Usuario Postulante de prueba
                { id: 3, name: "Estudiante Demo", email: "user@sgb.com", pass: "123", role: "applicant" }
            ];
            localStorage.setItem('sgb_users', JSON.stringify(initialUsers));
        }
        if (!localStorage.getItem('sgb_scholarships')) localStorage.setItem('sgb_scholarships', JSON.stringify([]));
        if (!localStorage.getItem('sgb_applications')) localStorage.setItem('sgb_applications', JSON.stringify([]));
        // No hay sesión activa al inicio
        sessionStorage.removeItem('currentUser');
    };

    // Helpers de Base de Datos
    const getDB = (key) => JSON.parse(localStorage.getItem(key));
    const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    const getCurrentUser = () => JSON.parse(sessionStorage.getItem('currentUser'));

    // --- MÓDULO DE AUTENTICACIÓN ---

    const login = () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const users = getDB('sgb_users');

        const user = users.find(u => u.email === email && u.pass === pass);

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            renderDashboard();
        } else {
            alert("Credenciales incorrectas");
        }
    };

    const register = () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        
        if (!name || !email || !pass) return alert("Complete todos los campos");

        const users = getDB('sgb_users');
        if (users.find(u => u.email === email)) return alert("El correo ya existe");

        const newUser = {
            id: Date.now(),
            name, email, pass,
            role: 'applicant' // Por defecto se registran como postulantes
        };

        users.push(newUser);
        setDB('sgb_users', users);
        alert("Registro exitoso. Por favor inicie sesión.");
        toggleAuth('login');
    };

    const logout = () => {
        sessionStorage.removeItem('currentUser');
        location.reload();
    };

    // --- MÓDULO DE LÓGICA DE NEGOCIO ---

    // Crear Convocatoria (Admin)
    const createScholarship = () => {
        const name = document.getElementById('beca-name').value;
        const desc = document.getElementById('beca-desc').value;
        const type = document.getElementById('beca-type').value;
        const start = document.getElementById('beca-start').value;
        const end = document.getElementById('beca-end').value;
        const reqs = document.getElementById('beca-reqs').value;

        if (!name || !start || !end) return alert("Campos obligatorios faltantes");

        const scholarships = getDB('sgb_scholarships');
        scholarships.push({
            id: Date.now(),
            name, desc, type, start, end, reqs,
            status: 'Abierta'
        });
        setDB('sgb_scholarships', scholarships);
        alert("Convocatoria creada exitosamente");
        document.getElementById('create-scholarship-form').reset();
        renderAdminDashboard();
    };

    // Postular (Postulante)
    let currentApplyingId = null; // ID temporal de la beca a aplicar

    const openApplyModal = (scholarshipId) => {
        const user = getCurrentUser();
        const apps = getDB('sgb_applications');
        
        // REGLA DE NEGOCIO: Un postulante no puede postular dos veces a la misma beca
        const existing = apps.find(a => a.userId === user.id && a.scholarshipId === scholarshipId);
        if (existing) return alert("Ya has postulado a esta beca.");

        currentApplyingId = scholarshipId;
        const scholarships = getDB('sgb_scholarships');
        const beca = scholarships.find(b => b.id === scholarshipId);
        document.getElementById('target-beca-title').innerText = `Aplicando a: ${beca.name}`;
        
        document.getElementById('application-modal').classList.remove('hidden');
    };

    const submitApplication = () => {
        const level = document.getElementById('app-level').value;
        const income = document.getElementById('app-income').value;
        const reason = document.getElementById('app-reason').value;
        const age = parseInt(document.getElementById('app-age').value);
        
        // MÓDULO 4.4: VALIDACIÓN DE REQUISITOS
        if (!level || !income || !reason || !age) return alert("Complete el formulario");
        
        let initialStatus = 'Enviada';
        
        // Validación Automática (Ejemplo: Edad mínima 18)
        if (age < 18) {
            alert("Su solicitud ha sido marcada como NO APTA automáticamente por no cumplir el requisito de edad.");
            initialStatus = 'Rechazada (Auto)';
        }

        const newApp = {
            id: Date.now(),
            scholarshipId: currentApplyingId,
            userId: getCurrentUser().id,
            data: { level, income, reason, age },
            status: initialStatus,
            date: new Date().toLocaleDateString(),
            evaluations: null
        };

        const apps = getDB('sgb_applications');
        apps.push(newApp);
        setDB('sgb_applications', apps);
        
        closeModal();
        renderApplicantDashboard();
        alert("Solicitud enviada");
    };

    // Evaluar (Evaluador)
    let currentEvaluationId = null;

    const openEvaluationModal = (appId) => {
        currentEvaluationId = appId;
        const apps = getDB('sgb_applications');
        const appData = apps.find(a => a.id === appId);
        const users = getDB('sgb_users');
        const applicant = users.find(u => u.id === appData.userId);

        const html = `
            <p><strong>Postulante:</strong> ${applicant.name}</p>
            <p><strong>Nivel:</strong> ${appData.data.level}</p>
            <p><strong>Motivo:</strong> ${appData.data.reason}</p>
            <p><strong>Edad:</strong> ${appData.data.dataAge || 'N/A'}</p>
        `;
        document.getElementById('modal-applicant-info').innerHTML = html;
        document.getElementById('evaluation-modal').classList.remove('hidden');
    };

    const submitEvaluation = (decision) => {
        const eco = parseInt(document.getElementById('score-eco').value) || 0;
        const acad = parseInt(document.getElementById('score-acad').value) || 0;
        const soc = parseInt(document.getElementById('score-social').value) || 0;
        const obs = document.getElementById('score-obs').value;

        // Cálculo automático
        const totalScore = eco + acad + soc;

        const apps = getDB('sgb_applications');
        const appIndex = apps.findIndex(a => a.id === currentEvaluationId);
        
        if (appIndex !== -1) {
            apps[appIndex].evaluations = {
                scores: { eco, acad, soc },
                total: totalScore,
                observations: obs
            };
            apps[appIndex].status = decision; // Aprobada o Rechazada
            setDB('sgb_applications', apps);
            closeModal();
            renderEvaluatorDashboard();
            alert(`Solicitud ${decision} con un puntaje de ${totalScore}`);
        }
    };

    // --- RENDERIZADO DE UI ---

    const renderDashboard = () => {
        const user = getCurrentUser();
        if (!user) return;

        // Ocultar Auth, Mostrar Nav
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('navbar').classList.remove('hidden');
        document.getElementById('user-role-display').innerText = `SGB - Rol: ${user.role.toUpperCase()} (${user.name})`;

        // Ocultar todos los dashboards primero
        document.querySelectorAll('.dashboard').forEach(d => d.classList.add('hidden'));

        // Router simple basado en roles
        if (user.role === 'admin') {
            document.getElementById('admin-dashboard').classList.remove('hidden');
            renderAdminDashboard();
        } else if (user.role === 'evaluator') {
            document.getElementById('evaluator-dashboard').classList.remove('hidden');
            renderEvaluatorDashboard();
        } else if (user.role === 'applicant') {
            document.getElementById('applicant-dashboard').classList.remove('hidden');
            renderApplicantDashboard();
        }
    };

    const renderAdminDashboard = () => {
        const scholarships = getDB('sgb_scholarships');
        const apps = getDB('sgb_applications');
        const container = document.getElementById('admin-scholarships-list');
        
        container.innerHTML = scholarships.map(s => `
            <div class="list-group-item">
                <div>
                    <strong>${s.name}</strong> (${s.type})<br>
                    <small>Estado: ${s.status} | Cierre: ${s.end}</small>
                </div>
                <button class="btn-danger" onclick="app.deleteScholarship(${s.id})">Eliminar</button>
            </div>
        `).join('');

        // Reportes Globales
        const approved = apps.filter(a => a.status === 'Aprobada').length;
        const rejected = apps.filter(a => a.status.includes('Rechazada')).length;
        const pending = apps.filter(a => a.status === 'Enviada').length;
        
        document.getElementById('admin-reports').innerHTML = `
            <p>Total Solicitudes: ${apps.length}</p>
            <p style="color: green">Aprobadas: ${approved}</p>
            <p style="color: red">Rechazadas: ${rejected}</p>
            <p style="color: orange">Pendientes: ${pending}</p>
        `;
    };

    const renderEvaluatorDashboard = () => {
        const apps = getDB('sgb_applications');
        const scholarships = getDB('sgb_scholarships');
        const container = document.getElementById('evaluator-tasks-list');

        // Filtrar solo las que están en estado "Enviada"
        const pendingApps = apps.filter(a => a.status === 'Enviada');

        if (pendingApps.length === 0) {
            container.innerHTML = '<p>No hay solicitudes pendientes.</p>';
            return;
        }

        container.innerHTML = pendingApps.map(a => {
            const beca = scholarships.find(s => s.id === a.scholarshipId);
            return `
            <div class="list-group-item">
                <div>
                    <strong>Beca: ${beca ? beca.name : 'Desconocida'}</strong><br>
                    <small>Fecha: ${a.date}</small>
                </div>
                <button class="btn-primary" onclick="app.openEvaluationModal(${a.id})">Evaluar</button>
            </div>
        `}).join('');
    };

    const renderApplicantDashboard = () => {
        // Tab Disponibles
        const scholarships = getDB('sgb_scholarships');
        const containerAvailable = document.getElementById('available-scholarships-list');
        
        containerAvailable.innerHTML = scholarships
            .filter(s => s.status === 'Abierta')
            .map(s => `
                <div class="scholarship-card">
                    <h4>${s.name}</h4>
                    <p>${s.desc}</p>
                    <small>Requisitos: ${s.reqs}</small><br><br>
                    <button class="btn-primary" onclick="app.openApplyModal(${s.id})">Postular</button>
                </div>
            `).join('');

        // Tab Historial
        const user = getCurrentUser();
        const apps = getDB('sgb_applications');
        const myApps = apps.filter(a => a.userId === user.id);
        const containerHistory = document.getElementById('my-applications-list');

        containerHistory.innerHTML = myApps.map(a => {
            const beca = scholarships.find(s => s.id === a.scholarshipId);
            return `
            <div class="list-group-item">
                <div>
                    <strong>${beca ? beca.name : '---'}</strong><br>
                    <span class="status-badge status-${a.status.split(' ')[0]}">${a.status}</span>
                    ${a.evaluations ? `<br><small>Puntaje: ${a.evaluations.total} pts</small>` : ''}
                </div>
            </div>
        `}).join('');
    };

    // Funciones Auxiliares UI
    const toggleAuth = (view) => {
        if(view === 'register') {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        } else {
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('register-form').classList.add('hidden');
        }
    };

    const switchTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        event.target.classList.add('active');
    };

    const closeModal = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        // Limpiar formularios
        document.getElementById('apply-form').reset();
        document.getElementById('score-eco').value = '';
        document.getElementById('score-acad').value = '';
        document.getElementById('score-social').value = '';
        document.getElementById('score-obs').value = '';
    };

    const deleteScholarship = (id) => {
        if(!confirm("¿Seguro que desea eliminar esta convocatoria?")) return;
        let list = getDB('sgb_scholarships');
        list = list.filter(s => s.id !== id);
        setDB('sgb_scholarships', list);
        renderAdminDashboard();
    };

    // Inicializar App
    initData();
    // Exponer funciones necesarias al DOM
    return {
        login, register, logout, toggleAuth,
        createScholarship, deleteScholarship,
        openApplyModal, submitApplication,
        switchTab,
        openEvaluationModal, submitEvaluation, closeModal
    };

})();

// Chequear sesión al cargar
if (sessionStorage.getItem('currentUser')) {
    // Hack para recargar dashboard sin exponer 'renderDashboard' directamente si no queremos
    // En este caso simple, simulamos un "re-login" visual
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    // Forzamos un reload visual simple llamando al login interno o recargando
    // Para simplificar, el usuario debe reloguear si refresca o guardamos estado en localStorage
    // Pero en main.js la función App se ejecuta al inicio. 
    // Para que funcione el F5, necesitamos exponer renderDashboard o manejarlo en init.
    // MODIFICACION: Añadido al final de App.
}