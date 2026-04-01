import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
    }, []);

    const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-xs w-full">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-fadeIn
                            ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
                            : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-white border-gray-200 text-gray-800'}`}
                    >
                        {t.type === 'success' && <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />}
                        {t.type === 'error' && <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />}
                        {t.type === 'info' && <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />}
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button
                            onClick={() => remove(t.id)}
                            className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 transition-colors"
                            aria-label="Fechar notificação"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
