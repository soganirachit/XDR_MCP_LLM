/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
        background: {
          DEFAULT: '#0f172a',
          secondary: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
