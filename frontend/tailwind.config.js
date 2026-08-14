/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': '#10b981',
        'eco-dark': '#064e3b',
        'eco-light': '#d1fae5',
      }
    },
  },
  plugins: [],
}
