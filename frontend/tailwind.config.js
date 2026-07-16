/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b1c28",
          soft: "#143044",
          muted: "#3d5a6c",
        },
        foam: {
          DEFAULT: "#f3f7f9",
          warm: "#eef4f6",
        },
        sea: {
          DEFAULT: "#1f6f7a",
          bright: "#2a8f9c",
          deep: "#15555e",
        },
        gold: {
          DEFAULT: "#c9a227",
          soft: "#e4c76a",
        },
        skill: {
          listening: "#2a7ab0",
          speaking: "#1f8a6a",
          reading: "#5b6bb5",
          writing: "#b8862e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(42, 143, 156, 0.18)",
        lift: "0 18px 50px rgba(11, 28, 40, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.55" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
