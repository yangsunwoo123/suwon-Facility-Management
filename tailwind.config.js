/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        suwon: {
          navy: '#003670',
          'navy-dark': '#002550',
          'navy-light': '#004a99',
          yellow: '#E9B800',
          'yellow-dark': '#c9a000',
          'yellow-light': '#f5cc33',
        },
      },
    },
  },
  plugins: [],
}
