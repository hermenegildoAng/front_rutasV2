/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tu color corporativo (puedes cambiar este azul/morado por el que uses)
        brand: '#4f46e5', 
      }
    },
  },
  plugins: [],
}