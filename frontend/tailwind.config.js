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
          DEFAULT: '#1ABC9C',
          50: '#E8F8F5',
          100: '#D1F2EB',
          200: '#A3E4D7',
          300: '#76D7C4',
          400: '#48C9B0',
          500: '#1ABC9C',
          600: '#17A589',
          700: '#148F77',
          800: '#117A65',
          900: '#0E6655',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          hover: '#F1F5F9',
          active: '#E0F2F1',
          border: '#E2E8F0',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        severity: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#F59E0B',
          low: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
