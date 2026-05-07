import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5000),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t, i) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} index={i} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onClose, index }) {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 350);
  };

  const config = {
    success: {
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-400/20',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
    error: {
      icon: <AlertCircle size={18} className="text-red-400" />,
      gradient: 'from-red-500/10 to-red-500/5',
      border: 'border-red-400/20',
      glow: 'rgba(239, 68, 68, 0.15)',
    },
    info: {
      icon: <Info size={18} className="text-orange-400" />,
      gradient: 'from-orange-500/10 to-orange-500/5',
      border: 'border-orange-400/20',
      glow: 'rgba(234, 88, 12, 0.15)',
    },
  };
  const c = config[toast.type] || config.info;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${c.border} min-w-[280px] max-w-[400px] ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(50px) saturate(220%)',
        WebkitBackdropFilter: 'blur(50px) saturate(220%)',
        boxShadow: `0 8px 32px ${c.glow}, 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${c.glow}, transparent)` }}>
        {c.icon}
      </div>
      <span className="text-sm font-medium text-slate-700 flex-1">{toast.message}</span>
      <button onClick={handleClose}
        className="p-1.5 rounded-lg hover:bg-slate-100/60 text-slate-400 hover:text-slate-600 transition-all duration-200"
        style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <X size={14} />
      </button>
    </div>
  );
}
