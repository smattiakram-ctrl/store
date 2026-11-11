/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: "#022c22", 900: "#064e3b", 800: "#065f46",
          700: "#047857", 600: "#059669", 500: "#10b981",
        },
        gold: { 300: "#e9c46a", 400: "#d4af37", 500: "#c9a227", 600: "#a8821c" },
      },
      fontFamily: {
        sans: ["'Tajawal'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(2,44,34,.25)",
        gold: "0 8px 30px -8px rgba(212,175,55,.45)",
      },
    },
  },
  plugins: [],
};
