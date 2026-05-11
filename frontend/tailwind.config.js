/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#38bdf8",
        secondary: "#0f172a",
        accent: "#0284c7",
      },
    },
  },
  plugins: [],
}
