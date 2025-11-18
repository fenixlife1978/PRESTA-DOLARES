/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        starbucks: {
          green: '#00704A',
          light: '#D4E9E2',
          dark: '#1E3932'
        }
      }
    }
  },
  plugins: []
}
