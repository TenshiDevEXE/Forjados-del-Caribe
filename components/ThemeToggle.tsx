import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../lib/types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      onClick={onToggle}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-elevated text-muted transition-all duration-150 ease-tahoe hover:border-navy-400 hover:text-ink active:scale-[0.98]"
      title={label}
      aria-label={label}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-200 ease-tahoe group-hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 ease-tahoe group-hover:-rotate-12" />
      )}
    </button>
  );
}
