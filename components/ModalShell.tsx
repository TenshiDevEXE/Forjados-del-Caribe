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
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`panel w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-lift animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-elevated p-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.softBg} ${accent.text}`}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
              {subtitle && <p className="text-xs uppercase tracking-wider text-muted">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-sunken hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
