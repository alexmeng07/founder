/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        founder: {
          bg: '#0d0d0d',
          card: '#1a1a1a',
          accent: '#7c3aed',
          accentHover: '#6d28d9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
