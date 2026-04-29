import type { Config } from "tailwindcss";

export default {
  content: ["./apps/web/index.html", "./apps/web/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff8f5",
        blush: "#ffe8ee",
        petal: "#f7b7c8",
        rose: "#df6f8e",
        mauve: "#a56d86",
        ink: "#33262d",
        sage: "#8ea68f",
        terracotta: "#bd735c"
      },
      boxShadow: {
        popup: "0 18px 55px rgba(128, 64, 86, 0.16)",
        soft: "0 12px 35px rgba(128, 64, 86, 0.12)"
      },
      keyframes: {
        "sheet-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "doodle-wiggle": {
          "0%, 100%": { transform: "rotate(-2deg) translateY(0)" },
          "50%": { transform: "rotate(2deg) translateY(-3px)" }
        },
        "soft-fade": {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "sheet-up": "sheet-up 380ms cubic-bezier(.2,.8,.2,1)",
        "doodle-wiggle": "doodle-wiggle 3.4s ease-in-out infinite",
        "soft-fade": "soft-fade 260ms ease-out"
      }
    }
  },
  plugins: []
} satisfies Config;
