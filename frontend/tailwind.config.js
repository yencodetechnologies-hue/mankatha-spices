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
          50: '#f2f7e8',
          100: '#e1eccb',
          200: '#cbe19e',
          300: '#b3d56d',
          400: '#9dc537',
          500: '#91c322',
          600: '#6b9312',
          700: '#4e6b0d',
          800: '#3d540a',
          900: '#2c3b07',
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
