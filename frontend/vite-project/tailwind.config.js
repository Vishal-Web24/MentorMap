/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body:    ["'Cabinet Grotesk'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        dark: {
          900: "#080c12",
          800: "#0d1117",
          700: "#161b22",
          600: "#21262d",
          500: "#30363d",
          400: "#484f58",
          300: "#6e7681",
        },
        // These are required for @apply in index.css
        text: {
          primary:   "#e6edf3",
          secondary: "#8b949e",
          muted:     "#6e7681",
        },
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                                 to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" },  to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};