/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07080B",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
          active: "rgba(255, 255, 255, 0.09)",
          glass: "rgba(255, 255, 255, 0.04)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          glass: "rgba(255, 255, 255, 0.14)",
          highlight: "rgba(255, 255, 255, 0.3)",
        },
        accent: {
          DEFAULT: "#38bdf8",
          glow: "rgba(56, 189, 248, 0.15)",
          silver: "#e2e8f0",
          violet: "#818cf8",
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-elevated": "0 20px 50px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
        "glow-accent": "0 0 40px -10px rgba(56, 189, 248, 0.3)",
        "glow-silver": "0 0 40px -10px rgba(226, 232, 240, 0.2)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
