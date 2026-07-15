'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const widths = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-h-text/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-white rounded-2xl shadow-modal animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-h-border">
          <h3 className="text-base font-semibold text-h-text">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-h-bg transition-colors text-h-text-muted hover:text-h-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
