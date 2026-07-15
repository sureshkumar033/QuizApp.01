/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(25 40% 9%)",
        foreground: "hsl(40 40% 96%)",
        card: { DEFAULT: "hsl(25 35% 14%)", foreground: "hsl(40 40% 96%)" },
        popover: { DEFAULT: "hsl(25 35% 14%)", foreground: "hsl(40 40% 96%)" },
        border: "hsl(30 25% 25%)",
        input: "hsl(25 25% 18%)",
        ring: "hsl(30 85% 60%)",
        primary: {
          DEFAULT: "hsl(20 85% 60%)",
          foreground: "hsl(25 40% 10%)",
          glow: "hsl(40 90% 68%)",
        },
        secondary: { DEFAULT: "hsl(25 25% 20%)", foreground: "hsl(40 40% 96%)" },
        muted: { DEFAULT: "hsl(25 25% 18%)", foreground: "hsl(35 15% 65%)" },
        accent: { DEFAULT: "hsl(40 90% 68%)", foreground: "hsl(25 40% 10%)" },
        destructive: { DEFAULT: "hsl(10 75% 55%)", foreground: "hsl(40 40% 96%)" },
        success: { DEFAULT: "hsl(155 55% 55%)", foreground: "hsl(25 40% 10%)" },
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 60px -10px hsl(30 90% 55% / 0.55)",
        card: "0 20px 60px -20px hsl(20 60% 4% / 0.75)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(15 90% 55%), hsl(40 95% 65%))",
        "gradient-card":
          "linear-gradient(160deg, hsl(25 35% 16% / 0.92), hsl(20 35% 12% / 0.92))",
        hero:
          "radial-gradient(ellipse at top left, hsl(20 85% 45% / 0.45), transparent 60%), radial-gradient(ellipse at bottom right, hsl(40 90% 55% / 0.30), transparent 55%), linear-gradient(180deg, hsl(25 40% 9%), hsl(20 45% 6%))",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out both",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 30px -5px hsl(30 90% 55% / 0.4)" },
          "50%": { boxShadow: "0 0 60px 0px hsl(40 95% 60% / 0.7)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
