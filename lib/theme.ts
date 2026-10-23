import { Box, Cpu, Hammer, HardHat, Shield, Wrench } from 'lucide-react';
import type { AccentColor, AccentStyles, LogoType } from './types';

// Clases estáticas por color de acento (Tailwind las conserva al compilar)
export const ACCENT_STYLES: Record<AccentColor, AccentStyles> = {
  amber: {
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-400',
    text: 'text-amber-400',
    softBg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgHover: 'hover:bg-emerald-400',
    text: 'text-emerald-400',
    softBg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/30',
  },
  blue: {
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-400',
    text: 'text-blue-400',
    softBg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/30',
  },
  violet: {
    bg: 'bg-violet-500',
    bgHover: 'hover:bg-violet-400',
    text: 'text-violet-400',
    softBg: 'bg-violet-500/15',
    border: 'border-violet-500/40',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-500/30',
  },
  rose: {
    bg: 'bg-rose-500',
    bgHover: 'hover:bg-rose-400',
    text: 'text-rose-400',
    softBg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    gradient: 'from-rose-500 to-pink-600',
    ring: 'ring-rose-500/30',
  },
};

export const ACCENT_COLORS: AccentColor[] = ['amber', 'emerald', 'blue', 'violet', 'rose'];

export const LOGO_ICONS: Record<LogoType, typeof Wrench> = {
  wrench: Wrench,
  hammer: Hammer,
  shield: Shield,
  cpu: Cpu,
  hardhat: HardHat,
  box: Box,
};

export const LOGO_TYPES: LogoType[] = ['wrench', 'hammer', 'shield', 'cpu', 'hardhat', 'box'];
