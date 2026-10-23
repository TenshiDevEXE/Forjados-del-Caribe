import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { AccentStyles } from '../lib/types';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  accent: AccentStyles;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function ModalShell({
  title,
  subtitle,
  icon,
  accent,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
}: ModalShellProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`glass-dark rounded-2xl border border-slate-700/50 w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-700/50 sticky top-0 glass-dark z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accent.softBg} ${accent.text} flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
