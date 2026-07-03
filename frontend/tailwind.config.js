/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ielts: {
          navy: "#1a365d",
          blue: "#2b6cb0",
          gold: "#d69e2e",
          light: "#ebf8ff",
        },
      },
    },
  },
  plugins: [],
};
