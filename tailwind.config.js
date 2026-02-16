/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./features/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 10px 30px -20px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
