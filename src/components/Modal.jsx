import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, wide }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleEsc);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleEsc); };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={panelRef} className={`modal-panel ${wide ? 'max-w-3xl' : 'max-w-lg'} w-full`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/30">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-300"
            style={{
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: 'rgba(241, 245, 249, 0.5)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.background = 'rgba(241, 245, 249, 0.5)'; }}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
