/**
 * PROFESSIONAL NOTIFICATION SYSTEM
 * Replaces all alerts with beautiful native notifications
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Create notification container
        this.createContainer();
        
        // Override native alert function
        this.overrideAlerts();
        
        // Add CSS styles
        this.addStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 99999; /* above app UI */
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                width: auto;
                min-width: 300px;
                padding: 16px 20px;
                border-radius: 8px;
                background: #fff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10001;
                transform: translateX(100%);
                opacity: 0;
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                pointer-events: auto;
                cursor: pointer;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.success {
                border-left: 4px solid #1d9b3e;
            }

            .notification.error {
                border-left: 4px solid #dc3545;
            }

            .notification.warning {
                border-left: 4px solid #f59e0b;
            }

            .notification.info {
                border-left: 4px solid #3b82f6;
            }

            .notification i {
                font-size: 20px;
            }

            .notification.success i {
                color: #1d9b3e;
            }

            .notification.error i {
                color: #dc3545;
            }

            .notification.warning i {
                color: #f59e0b;
            }

            .notification.info i {
                color: #3b82f6;
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 2px;
                color: #333;
                font-family: 'Inter', sans-serif;
            }

            .notification-close {
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 16px;
                margin-left: 12px;
            }

            .notification-close:hover {
                background: #f1f5f9;
                color: #374151;
            }

            .notification-content {
                flex: 1;
            }

            .notification-message {
                font-size: 13px;
                color: #666;
                line-height: 1.5;
                margin: 0;
                font-family: 'Inter', sans-serif;
            }
        `;
        document.head.appendChild(style);
    }

    confirm(title, message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99998;';
        overlay.innerHTML = `
            <div style="background:#ffffff;border-radius:12px;padding:20px;max-width:460px;width:92%;box-shadow:0 12px 30px rgba(0,0,0,0.2);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <h3 style="margin:0;color:#1d9b3e;font-weight:700;">${title || 'Confirm'}</h3>
                    <button id="confirmCloseBtn" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6b7280">&times;</button>
                </div>
                <div style="color:#374151;font-size:14px;line-height:1.5;">${message || ''}</div>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">
                    <button id="confirmCancelBtn" style="background:#6b7280;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">Cancel</button>
                    <button id="confirmOkBtn" style="background:#1d9b3e;color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;">OK</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        function close(){ if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
        overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });
        overlay.querySelector('#confirmCloseBtn').onclick = ()=>{ close(); if (onCancel) onCancel(); };
        overlay.querySelector('#confirmCancelBtn').onclick = ()=>{ close(); if (onCancel) onCancel(); };
        overlay.querySelector('#confirmOkBtn').onclick = ()=>{ close(); if (onConfirm) onConfirm(); };
        return overlay;
    }

    overrideAlerts() {
        // Override native alert
        const originalAlert = window.alert;
        window.alert = (message) => {
            this.show('info', 'Alert', message);
        };

        // Override console.error - LOG ONLY, NO NOTIFICATIONS
        // User wants to see errors only in F12 console, not as notifications
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Always log to console (F12)
            originalConsoleError.apply(console, args);
            // DO NOT show notification - user wants errors only in console
        };
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    }

    showNativeNotification(type = 'info', title = 'Notification', message = '', options = {}) {
        if (!('Notification' in window)) {
            return null;
        }
        
        if (Notification.permission === 'granted') {
            const iconMap = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            const notification = new Notification(title, {
                body: message,
                icon: options.icon || '/favicon.ico',
                badge: options.badge || '/favicon.ico',
                tag: options.tag || `notification-${Date.now()}`,
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false
            });
            
            // Auto close after duration
            if (options.duration && options.duration > 0) {
                setTimeout(() => {
                    notification.close();
                }, options.duration);
            }
            
            return notification;
        }
        
        return null;
    }

    show(type = 'info', title = 'Notification', message = '', duration = 5000, useNative = false) {
        // Try native notification first if requested and permission granted
        if (useNative && 'Notification' in window && Notification.permission === 'granted') {
            this.showNativeNotification(type, title, message, { duration });
        }
        
        // Always show in-page notification for visibility
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Font Awesome icons (Admin Panel style)
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        // Click to dismiss
        notification.addEventListener('click', () => {
            this.remove(notification);
        });

        return notification;
    }

    remove(notification) {
        if (notification && notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    success(title, message, duration = 5000) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration = 7000) {
        // HIDDEN: Don't show error notifications, only log to console
        // User wants to see errors only in F12 console
        console.error(`[Error Notification Hidden] ${title}: ${message}`);
        return null; // Return null instead of showing notification
    }

    warning(title, message, duration = 6000) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration = 5000) {
        return this.show('info', title, message, duration);
    }
}

// Initialize notification system
window.notificationSystem = new NotificationSystem();

// Global helper functions
window.showNotification = (type, title, message, duration, useNative = false) => {
    return window.notificationSystem.show(type, title, message, duration, useNative);
};

// Request notification permission
window.requestNotificationPermission = async () => {
    return await window.notificationSystem.requestPermission();
};

window.showSuccess = (title, message, duration) => {
    return window.notificationSystem.success(title, message, duration);
};

window.showError = (title, message, duration) => {
    // HIDDEN: Don't show error notifications, only log to console
    // User wants to see errors only in F12 console
    console.error(`[Error Notification Hidden] ${title}: ${message}`);
    return null; // Return null instead of showing notification
};

window.showWarning = (title, message, duration) => {
    return window.notificationSystem.warning(title, message, duration);
};

window.showInfo = (title, message, duration) => {
    return window.notificationSystem.info(title, message, duration);
};

// Professional confirm dialog helper
window.showConfirm = (title, message, onConfirm, onCancel) => {
    return window.notificationSystem.confirm(title, message, onConfirm, onCancel);
};

// Override alert function globally
window.alert = (message) => {
    window.showInfo('Alert', message);
};

console.log('🎉 Notification System Initialized!');

