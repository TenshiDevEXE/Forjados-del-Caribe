import { Box, Cpu, Hammer, HardHat, Shield, Wrench } from 'lucide-react';
import type { AccentColor, AccentStyles, LogoType } from './types';

// Clases estáticas por color de acento (Tailwind las conserva al compilar).
//
// Cada valor incluye su variante "dark:" cuando hace falta, porque el texto de
// un acento debe ser oscuro sobre fondo claro y claro sobre fondo oscuro.
export const ACCENT_STYLES: Record<AccentColor, AccentStyles> = {
  // Dorado apagado: acento de la marca, sobre azul marino casi negro para
  // conseguir el contraste propio de una web corporativa.
  gold: {
    bg: 'bg-gold-500',
    bgHover: 'hover:bg-gold-600',
    onAccent: 'text-navy-950',
    text: 'text-gold-700 dark:text-gold-300',
    softBg: 'bg-gold-500/10',
    border: 'border-gold-500/40',
    gradient: 'from-navy-800 to-navy-950',
    ring: 'ring-gold-500/30',
  },
  // Azul marino: acento sobrio, sin dorado.
  navy: {
    bg: 'bg-navy-700',
    bgHover: 'hover:bg-navy-600',
    onAccent: 'text-white',
    text: 'text-navy-700 dark:text-navy-300',
    softBg: 'bg-navy-500/10',
    border: 'border-navy-500/40',
    gradient: 'from-navy-700 to-navy-900',
    ring: 'ring-navy-500/30',
  },
  // Verde apagado: alternativa neutra para quien no quiera dorado.
  emerald: {
    bg: 'bg-emerald-700',
    bgHover: 'hover:bg-emerald-600',
    onAccent: 'text-white',
    text: 'text-emerald-700 dark:text-emerald-300',
    softBg: 'bg-emerald-600/10',
    border: 'border-emerald-600/35',
    gradient: 'from-emerald-800 to-emerald-950',
    ring: 'ring-emerald-600/30',
  },
};

export const ACCENT_COLORS: AccentColor[] = ['gold', 'navy', 'emerald'];

export const LOGO_ICONS: Record<LogoType, typeof Wrench> = {
  wrench: Wrench,
  hammer: Hammer,
  shield: Shield,
  cpu: Cpu,
  hardhat: HardHat,
  box: Box,
};

export const LOGO_TYPES: LogoType[] = ['wrench', 'hammer', 'shield', 'cpu', 'hardhat', 'box'];
