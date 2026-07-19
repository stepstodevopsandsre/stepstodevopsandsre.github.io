/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        spotlight: "rgb(var(--color-spotlight) / <alpha-value>)"
      },
      boxShadow: {
        panel: "0 28px 80px -30px rgba(9, 9, 11, 0.5)",
        glow: "0 0 0 1px rgba(236,72,153,0.16), 0 16px 48px -24px rgba(236,72,153,0.45)"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"]
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(161, 161, 170, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(161, 161, 170, 0.08) 1px, transparent 1px)",
        sheen: "radial-gradient(circle at top left, rgba(236,72,153,0.18), transparent 32%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 26%)"
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "rgb(var(--color-text))",
            a: {
              color: "rgb(var(--color-accent))",
              textDecoration: "none",
              fontWeight: "600"
            },
            strong: { color: "rgb(var(--color-text))" },
            h2: { color: "rgb(var(--color-text))", fontFamily: "'Space Grotesk', sans-serif" },
            h3: { color: "rgb(var(--color-text))", fontFamily: "'Space Grotesk', sans-serif" },
            h4: { color: "rgb(var(--color-text))", fontFamily: "'Space Grotesk', sans-serif" },
            code: {
              color: "rgb(var(--color-text))",
              backgroundColor: "rgb(var(--color-accent-soft))",
              borderRadius: "0.375rem",
              paddingInline: "0.35rem",
              paddingBlock: "0.125rem"
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            pre: {
              backgroundColor: "rgb(var(--color-surface))",
              border: "1px solid rgb(var(--color-border))",
              borderRadius: "1rem"
            },
            blockquote: {
              color: "rgb(var(--color-muted))",
              borderLeftColor: "rgb(var(--color-accent))"
            }
          }
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
