import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../lib/types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  accentBg: string;
}

export default function ThemeToggle({ theme, onToggle, accentBg }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-xl transition-all hover:scale-110 ${accentBg} text-slate-950`}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
