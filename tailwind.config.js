/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12110F',
        cream: '#F7F4EF',
        sand: '#EFE9E0',
        beige: '#E3D9CB',
        clay: '#4A3728',
        stone: '#8C857B',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        site: '80rem',
      },
    },
  },
  plugins: [],
};
