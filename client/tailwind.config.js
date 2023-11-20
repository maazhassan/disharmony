/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '45rem': '45rem',
        'inputh': '2.5rem',
      },
      width: {
        '33.5rem': '33.5rem',
        'inputm': '2.75rem',
        'inputw': '17.5rem',
      },
      spacing: {
        't-indent': '0.74rem',
      },
      colors: {
        "bg-color": "var(--bg-color: #4C4254)",
        "app-orang": "var(--app-orange: #ED7B82)",
        "modal-color": "var(--modal-color: #635971)",
        "ban-color": "var(--ban-btn: #C73F47)",
        "app-pink": "var(--pink: #ed7b82)",
      },
    },
  },
  plugins: [],
}

