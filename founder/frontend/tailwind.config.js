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
          bg: '#ffffff',
          card: '#f5f5f5',
          accent: '#000000',
          accentHover: '#171717',
          purple: '#6B21A8',
          purpleLight: '#7C3AED',
          purpleMuted: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        logo: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
