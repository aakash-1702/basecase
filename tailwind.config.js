/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: "#f97316",
        amber: "#fbbf24",
        bg: "#0a0a0f",
        surface: "#0c0c0f",
        surface2: "#12151a",
        "bc-bg": "#0a0a0f",
        "bc-accent": "#f05a28",
        "bc-accent-hover": "#e8481e",
        "bc-accent-secondary": "#f5a623",
        "bc-surface": "#111118",
        "bc-card": "rgba(255,255,255,0.035)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
