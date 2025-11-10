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
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                backdrop-filter: blur(10px);
                max-width: 400px;
                min-width: 300px;
                position: relative;
                overflow: hidden;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                cursor: pointer;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                border-radius: 12px 12px 0 0;
            }

            .notification.success::before {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            }

            .notification.error::before {
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            }

            .notification.warning::before {
                background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            }

            .notification.info::before {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 13px;
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            }

            .notification-close:hover {
                background: #f1f5f9;
                color: #374151;
            }

            .notification-message {
                font-size: 12px;
                color: #64748b;
                line-height: 1.5;
                margin: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }

            .notification-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 12px;
                color: white;
                font-weight: 600;
            }

            .notification.success .notification-icon {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            }

            .notification.error .notification-icon {
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            }

            .notification.warning .notification-icon {
                background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            }

            .notification.info .notification-icon {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
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

        // Override console.error for better UX (but skip background polling errors)
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            const message = args.join(' ');
            
            // Skip notifications for background polling/API errors that are handled gracefully
            const silentErrors = [
                'active students count',
                'tracking student activity',
                'Error fetching active students',
                'Error tracking student activity'
            ];
            
            const shouldShowNotification = !silentErrors.some(silent => 
                message.toLowerCase().includes(silent.toLowerCase())
            );
            
            if (shouldShowNotification && (message.includes('error') || message.includes('Error') || message.includes('failed'))) {
                this.show('error', 'Error', message);
            }
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
        
        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <div class="notification-icon">${iconMap[type] || 'ℹ'}</div>
                    ${title}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <p class="notification-message">${message}</p>
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
        return this.show('error', title, message, duration);
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
    return window.notificationSystem.error(title, message, duration);
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

