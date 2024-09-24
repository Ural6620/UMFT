/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#022726",
        sub: "#fdaf0a",
        show: "#283D88"
      },
    },
  },
  plugins: [],
};
