/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // CineVault Emerald/Cyan Accent
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        cinema: {
          bg: '#0a0d14',
          surface: '#111726',
          card: '#161f33',
          border: '#1f2b45',
          muted: '#8e9bb5',
          gold: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-vignette': 'linear-gradient(to top, #0a0d14 10%, rgba(10, 13, 20, 0.7) 50%, rgba(10, 13, 20, 0.3) 100%)',
      },
    },
  },
  plugins: [],
};
