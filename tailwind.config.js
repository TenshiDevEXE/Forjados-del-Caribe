/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    // lib/theme.ts contiene las clases de cada acento: sin este glob
    // Tailwind las elimina al compilar y el acento deja de aplicarse.
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superficies y texto resueltos con las variables de index.css: así el
        // tema claro/oscuro se cambia desde un único sitio y no repitiendo clases.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        sunken: 'rgb(var(--sunken) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        // Azul marino corporativo: estructura, cabecera y pie de página.
        navy: {
          50: '#f3f6fa',
          100: '#e5ecf4',
          200: '#c6d6e7',
          300: '#9db6d1',
          400: '#6d8fb4',
          500: '#496f99',
          600: '#36577d',
          700: '#294464',
          800: '#1c3149',
          900: '#122238',
          950: '#0a1626',
        },
        // Dorado apagado: el acento de la marca, usado con moderación.
        gold: {
          50: '#fbf8f1',
          100: '#f6efdf',
          200: '#ecdcb8',
          300: '#dfc58c',
          400: '#cdab63',
          500: '#b9903f',
          600: '#9b7530',
          700: '#7b5a28',
          800: '#5f4622',
          900: '#4a371d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 1px 0 rgb(10 15 25 / 0.02), 0 8px 24px -14px rgb(10 15 25 / 0.14)',
        lift: '0 1px 1px 0 rgb(10 15 25 / 0.02), 0 16px 36px -18px rgb(10 15 25 / 0.20)',
        tahoe: '0 1px 1px rgb(255 255 255 / 0.01), 0 10px 30px -22px rgb(10 15 25 / 0.28)',
        'tahoe-lift': '0 1px 1px rgb(255 255 255 / 0.01), 0 22px 60px -32px rgb(10 15 25 / 0.34)',
      },
      transitionTimingFunction: {
        tahoe: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
        280: '280ms',
      },
    },
  },
  plugins: [],
}
