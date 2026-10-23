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
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-elevated text-muted transition-colors hover:border-navy-400 hover:text-ink"
      title={label}
      aria-label={label}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
