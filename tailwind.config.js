/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2fce4',
          100: '#e8f9c8',
          200: '#d3f391',
          300: '#b8e64c',
          400: '#9dd321',
          500: '#84b817',
          600: '#6b9312',
          700: '#567610',
          800: '#455f0d',
          900: '#3a4f0b',
        },
        secondary: {
          50: '#fffceb',
          100: '#fff9d6',
          200: '#fff3a8',
          300: '#ffeb6f',
          400: '#ffe23f',
          500: '#ffd915',
          600: '#e6c200',
          700: '#b99a00',
          800: '#937800',
          900: '#786200',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
