/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#1aff1a',
          500: '#00e600',
          600: '#00aa00',
          700: '#008000',
          800: '#006600',
          900: '#004d00',
        },
      },
    },
  },
  plugins: [],
};
