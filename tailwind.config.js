/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          650: '#4B5563',
          750: '#374151',
        }
      }
    },
  },
  plugins: [],
};
