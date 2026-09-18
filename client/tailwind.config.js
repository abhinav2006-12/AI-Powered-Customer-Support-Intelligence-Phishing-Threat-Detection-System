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
        sidebar: {
          bg: '#0F172A',
          hover: '#1E293B',
          active: '#334155',
          text: '#94A3B8',
          textActive: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
