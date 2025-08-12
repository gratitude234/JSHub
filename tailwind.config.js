/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {colors: {
        primary:  '#003f7f',
        accent:   '#7f4000',
        success:  '#28a745',
        neutral:  '#F7F9FC',
        content:  '#2C3E50'
      }},
  },
  plugins: [],
}
