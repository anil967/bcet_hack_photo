import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        odyssey: {
          bg: "#0a0705",
          card: "rgba(28, 19, 11, 0.88)",
          parchment: "rgba(22, 15, 9, 0.92)",
          gold: "#f39c12",
          "gold-bright": "#ffd700",
          "gold-dark": "#b78103",
          bronze: "#8e5a2b",
          "bronze-dark": "#2a1a0f",
          border: "rgba(243, 156, 18, 0.4)",
          text: "#e0d5c1",
          muted: "#a89680",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Cinzel", "serif"],
        heading: ["var(--font-cinzel)", "Cinzel", "serif"],
        body: ["var(--font-marcellus)", "Marcellus", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        goldPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.03)" },
        },
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
        "gold-pulse": "goldPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
