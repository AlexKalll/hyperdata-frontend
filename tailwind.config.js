/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryButton: "#095FAF",
        green: {
          600: "#16a34a",
        },
        myGreen: "#00AC26",
        blue: {
          600: "#2563eb", // For buttons
          700: "#1d4ed8",
        },
        primary: "#095FAF",
      },
    },
  },
  plugins: [],
};
