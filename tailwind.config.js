/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Esto le dice a Tailwind qué archivos escanear
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  // 2. Aquí va el plugin de PrimeUI que querías
  plugins: [
    require('tailwindcss-primeui')
  ],
};
