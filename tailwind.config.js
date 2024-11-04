/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'dark': '#1a202c',
        'dark-lighter': '#2d3748',
      },
      textColor: {
        'dark': '#e2e8f0',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
