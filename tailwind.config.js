/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'felt-base': '#0F380F',
        'felt-light': '#1A4D1A',
        'felt-dark': '#0a240a',
        'wood-light': '#5C4033',
        'wood-dark': '#3E2723',
        'gold-400': '#D4AF37',
        'gold-500': '#C5A028',
        'gold-600': '#B08d20',
        'poker-red': '#C32020',
        'poker-black': '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
