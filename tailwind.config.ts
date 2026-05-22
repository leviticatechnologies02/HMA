import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1F7A82",
        secondary: "#FF6B35",
        accent: "#FFD166",
        neutral: "#F8F9FA",
        dark: "#1A1A2E",
        ink: "#1A1A2E",
        success: "#06D6A0",
        warning: "#FFB703",
        error: "#EF476F",
        "bg-deep": "#0D0D1A",
        "bg-light": "#FFF8F3",
        tealblue: "#367588",
        lowesblue: "#004792",
      },

      animation: {
        "float": "float 4s ease-in-out infinite",
        "float-delay": "float 4s ease-in-out 1s infinite",
        "float-delay-2": "float 4s ease-in-out 2s infinite",
        "fade-in-up": "fadeInUp 0.6s ease forwards",
        "fade-in-left": "fadeInLeft 0.6s ease forwards",
        "fade-in-right": "fadeInRight 0.6s ease forwards",
        "scale-in": "scaleIn 0.4s ease forwards",
        "pulse-ring": "pulseRing 1.5s ease-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "shimmer": "shimmer 3s linear infinite",
        "slide-up": "slideUp 0.3s ease forwards",
        "count-up": "countUp 0.5s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundSize: {
        "200%": "200%",
      },
      boxShadow: {
        "glow-primary": "0 0 30px rgba(255, 107, 53, 0.3)",
        "glow-success": "0 0 30px rgba(6, 214, 160, 0.3)",
        "card": "0 2px 15px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 20px 60px rgba(255, 107, 53, 0.15)",
        "btn": "0 4px 15px rgba(255, 107, 53, 0.3)",
        "btn-hover": "0 8px 25px rgba(255, 107, 53, 0.4)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
