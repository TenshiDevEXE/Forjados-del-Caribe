/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
      boxShadow: {
        soft: '0 1px 2px 0 rgb(10 15 25 / 0.04), 0 10px 24px -14px rgb(10 15 25 / 0.14)',
        lift: '0 2px 6px 0 rgb(10 15 25 / 0.06), 0 18px 34px -18px rgb(10 15 25 / 0.22)',
      },
    },
  },
  plugins: [],
}
