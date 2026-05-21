/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Corporate blue (Material Blue) — storefront + admin accents */
        primary: {
          50: '#f6fbf0',
          100: '#ebf6dd',
          200: '#d3ecb2',
          300: '#b3dc7e',
          400: '#90c549',
          500: '#8dbe20',
          600: '#6b9514',
          700: '#4f7112',
          800: '#334b0b',
          900: '#1c2b05',
        },
        /** Complementary slate for secondary UI */
        secondary: {
          50: '#eceff1',
          100: '#cfd8dc',
          200: '#b0bec5',
          300: '#90a4ae',
          400: '#78909c',
          500: '#607d8b',
          600: '#546e7a',
          700: '#455a64',
          800: '#37474f',
          900: '#263238',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
