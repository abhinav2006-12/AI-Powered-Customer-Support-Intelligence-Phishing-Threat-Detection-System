/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0284C7',
          600: '#0284C7',
          700: '#0369A1',
          900: '#0C4A6E',
        },
        kaaval: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#3B0764',
          glow: '#A855F7',
          dark: '#080C1A',
        },
        sidebar: {
          bg: '#0B0F1E',
          hover: '#141C33',
          active: '#1F294D',
          text: '#94A3B8',
          textActive: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
