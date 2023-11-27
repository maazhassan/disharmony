/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-color": "#4C4254",
        "app-orange": "#ED7B82",
        "modal-color": "#635971",
        "ban-color": "#C73F47",
        "app-pink": "#ED7B82",
      },
    },
  },
  plugins: [],
}

