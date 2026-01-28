import React, { useState, useEffect } from 'react';
import '../css/toast.css';

const Toast = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleShowToast = (event) => {
            const { message, type = 'info' } = event.detail;
            const id = Date.now();

            setToasts(prev => [...prev, { id, message, type }]);

            // Auto remove after 3 seconds
            setTimeout(() => {
                removeToast(id);
            }, 3000);
        };

        window.addEventListener('show-toast', handleShowToast);
        return () => window.removeEventListener('show-toast', handleShowToast);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type} show`}>
                    <div className="toast-icon">
                        {toast.type === 'success' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4757">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        )}
                        {toast.type === 'info' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2196f3">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                            </svg>
                        )}
                    </div>
                    <span className="toast-message">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default Toast;
