import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      colors: {
        brand: {
          maroon: "#6b1a1a",
          emerald: "#2e6b3e",
          mustard: "#c4943a",
          cream: "#fdf8f3",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#fafafa",
          tertiary: "#f5f5f5",
        },
        border: {
          DEFAULT: "#e5e5e5",
          subtle: "#f0f0f0",
        },
        text: {
          primary: "#0a0a0a",
          secondary: "#6b5c4c",
          tertiary: "#9a8c7d",
        },
      },
      keyframes: {
        waveform: {
          "0%, 100%": { transform: "scaleY(0.2)" },
          "50%": { transform: "scaleY(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "generating-fill": {
          "0%": { width: "0%" },
          "50%": { width: "80%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        waveform: "waveform 0.8s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        wave: "wave 8s linear infinite",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "generating-fill": "generating-fill 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
