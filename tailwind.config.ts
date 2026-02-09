import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk neon accents
        neon: {
          blue: "#00d9ff",
          magenta: "#ff00ff",
          green: "#39ff14",
          orange: "#ff9500",
          purple: "#b026ff",
        },
        // Dark backgrounds
        bg: {
          black: "#000000",
          charcoal: "#0a0a0a",
          darkGray: "#1a1a1a",
          card: "#141414",
        },
        // Metallic/Chrome
        metal: {
          silver: "#8e8e93",
          chrome: "#c7c7cc",
        },
        // Readable text (high contrast)
        primary: "#ffffff",
        secondary: "#d1d1d6",
      },
      fontSize: {
        "body": ["1rem", { lineHeight: "1.6" }],      // 16px
        "body-lg": ["1.125rem", { lineHeight: "1.6" }], // 18px
        "heading-xs": ["1.25rem", { lineHeight: "1.4" }],
        "heading-sm": ["1.5rem", { lineHeight: "1.35" }],
        "heading-md": ["2rem", { lineHeight: "1.3" }],
        "heading-lg": ["2.5rem", { lineHeight: "1.25" }],
        "heading-xl": ["3rem", { lineHeight: "1.2" }],
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        "space-mono": ["Space Mono", "monospace"],
        "ibm-plex-mono": ["IBM Plex Mono", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "neon-blue": "0 0 12px rgba(0, 217, 255, 0.25)",
        "neon-magenta": "0 0 12px rgba(255, 0, 255, 0.25)",
        "neon-green": "0 0 12px rgba(57, 255, 20, 0.25)",
        "neon-orange": "0 0 12px rgba(255, 149, 0, 0.25)",
        "card-glow-blue": "0 0 20px rgba(0, 217, 255, 0.15), 0 0 40px rgba(0, 217, 255, 0.08)",
        "card-glow-magenta": "0 0 20px rgba(255, 0, 255, 0.15), 0 0 40px rgba(255, 0, 255, 0.08)",
        "card-glow-green": "0 0 20px rgba(57, 255, 20, 0.15), 0 0 40px rgba(57, 255, 20, 0.08)",
        "card-glow-orange": "0 0 20px rgba(255, 149, 0, 0.15), 0 0 40px rgba(255, 149, 0, 0.08)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glitch: "glitch 1s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "cursor-blink": "cursor-blink 1s step-end infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 8px currentColor)",
          },
          "50%": {
            opacity: "0.8",
            filter: "drop-shadow(0 0 12px currentColor)",
          },
        },
        "cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
