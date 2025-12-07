class ErrorLogger {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Límite de errores en memoria
    }

    log(error, context = '') {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || '',
            context: context,
            userAgent: navigator.userAgent
        };

        this.errors.push(errorEntry);
        
        // Limitar el número de errores en memoria
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Mostrar en consola
        console.error(`[${errorEntry.timestamp}] ${context}:`, error);

        // Guardar en localStorage para persistencia
        this.saveToLocalStorage();

        return errorEntry;
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('errorLogs', JSON.stringify(this.errors));
        } catch (e) {
            console.warn('No se pudo guardar el error en localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('errorLogs');
            if (stored) {
                this.errors = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('No se pudo cargar errores desde localStorage:', e);
        }
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('errorLogs');
    }

    downloadErrorLog() {
        const blob = new Blob([JSON.stringify(this.errors, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Instancia global del logger
export const errorLogger = new ErrorLogger();
errorLogger.loadFromLocalStorage();

// Capturar errores globales
window.addEventListener('error', (event) => {
    errorLogger.log(event.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log(event.reason, 'Unhandled Promise Rejection');
});