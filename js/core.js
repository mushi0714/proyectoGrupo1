/**
 * Sistema de Gestión de Becas y Ayudas - Core Logic
 */

// --- CONFIGURATION & CONSTANTS ---
const APP_KEYS = {
    USERS: 'SGBA_users',
    CONVOCATORIAS: 'SGBA_convocatorias',
    SOLICITUDES: 'SGBA_solicitudes',
    CURRENT_USER: 'SGBA_currentUser'
};

const ROLES = {
    ADMIN: 'admin',
    EVALUADOR: 'evaluador',
    POSTULANTE: 'postulante'
};

// --- STORAGE MANAGER ---
class StorageManager {
    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static add(key, item) {
        const list = this.get(key) || [];
        list.push(item);
        this.set(key, list);
    }

    static update(key, id, updates) {
        const list = this.get(key) || [];
        const index = list.findIndex(i => i.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            this.set(key, list);
            return true;
        }
        return false;
    }

    static delete(key, id) {
        let list = this.get(key) || [];
        list = list.filter(i => i.id !== id);
        this.set(key, list);
    }
}

// --- INITIALIZER / SEEDER ---
class AppInitializer {
    static init() {
        if (!StorageManager.get(APP_KEYS.USERS)) {
            console.log("Seeding initial data...");
            
            // Seed Admin
            const admin = {
                id: 'admin-001',
                username: 'admin@admin.com',
                password: 'admin', // In a real app, hash this
                role: ROLES.ADMIN,
                name: 'Administrador Principal'
            };

            // Seed Evaluator
            const evaluator = {
                id: 'eval-001',
                username: 'eval@admin.com',
                password: 'eval',
                role: ROLES.EVALUADOR,
                name: 'Evaluador Ejemplo'
            };

            StorageManager.set(APP_KEYS.USERS, [admin, evaluator]);
            StorageManager.set(APP_KEYS.CONVOCATORIAS, []);
            StorageManager.set(APP_KEYS.SOLICITUDES, []);
        }
    }
}

// --- AUTH MANAGER ---
class AuthManager {
    static login(username, password) {
        const users = StorageManager.get(APP_KEYS.USERS) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            StorageManager.set(APP_KEYS.CURRENT_USER, user);
            return user;
        }
        return null;
    }

    static register(userData) {
        const users = StorageManager.get(APP_KEYS.USERS) || [];
        
        // Check if exists
        if (users.find(u => u.username === userData.username)) {
            throw new Error('El usuario ya existe');
        }

        const newUser = {
            id: crypto.randomUUID(),
            ...userData,
            role: ROLES.POSTULANTE // Default registration is always applicant
        };

        StorageManager.add(APP_KEYS.USERS, newUser);
        return newUser;
    }

    static logout() {
        localStorage.removeItem(APP_KEYS.CURRENT_USER);
        window.location.href = '../../index.html';
    }

    static getCurrentUser() {
        return StorageManager.get(APP_KEYS.CURRENT_USER);
    }

    static checkAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = '../../index.html';
            return null;
        }
        return user;
    }
    
    static requireRole(role) {
        const user = this.checkAuth();
        if (user && user.role !== role) {
             // Redirect based on correct role to prevent loops
             this.redirectUser(user);
        }
    }

    static redirectUser(user) {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : 'pages/';
        
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('proyectogrupo1/')) {
             // Being in root is okay, we are redirecting away
        } else {
            // If we are already in the right folder, don't redirect (basic check)
            // This logic needs to be robust. 
            // Simple approach: Always use absolute paths from root or relative from pages.
            // Let's assume we call this ONLY from login or root index.
        }

        switch(user.role) {
            case ROLES.ADMIN:
                window.location.href = '/pages/admin/dashboard.html'; // Absolute path approach might fail on local file system without server
                // Better to use relative logic or assume structure. 
                // Since this is file:// usually, we need to be careful.
                // Quick fix: user relative paths assuming we are at root index.html
                // If we are deep, this helper might need context.
                // For now, let's let the caller handle exact paths, or implementing a robust relative path finder.
                break;
        }
    }
}

// Initialize only if window exists (browser env)
if (typeof window !== 'undefined') {
    AppInitializer.init();
}
