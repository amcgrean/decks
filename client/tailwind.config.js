/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#1E3A2C', dark: '#182218' },
        gold:  { DEFAULT: '#C4924A' },
        cream: { DEFAULT: '#F0EAD8' },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
