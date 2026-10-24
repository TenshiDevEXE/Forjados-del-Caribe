import { useEffect, useRef, type ReactNode } from 'react';
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    if (firstElement) {
      setTimeout(() => firstElement.focus(), 50);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && focusableElements && focusableElements.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 supports-[backdrop-filter]:backdrop-blur-md animate-fade-in"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        className={`panel w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-tahoe-lift rounded-3xl animate-scale-spring`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-elevated/95 backdrop-blur-xl p-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.softBg} ${accent.text}`}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h2 id="modal-title" className="text-base font-bold tracking-tight text-ink">
                {title}
              </h2>
              {subtitle && <p className="text-xs uppercase tracking-wider text-muted">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-all duration-150 ease-tahoe hover:bg-sunken hover:text-ink active:scale-[0.98]"
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
