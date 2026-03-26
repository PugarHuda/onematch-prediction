import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          yellow: "#FFE500",
          pink: "#FF3CAC",
          blue: "#4DFFFF",
          green: "#00FF87",
          orange: "#FF6B00",
          red: "#FF2D55",
          purple: "#BF5FFF",
          black: "#0A0A0A",
          white: "#FAFAFA",
          cream: "#FFF8E7",
          // Fun bg colors
          bg: "#F5F0E8",       // warm cream - main bg
          card1: "#FFE500",    // yellow
          card2: "#FF3CAC",    // pink
          card3: "#4DFFFF",    // cyan
          card4: "#00FF87",    // green
          card5: "#BF5FFF",    // purple
        },
      },
      fontFamily: {
        mono: ["'Space Mono'", "monospace"],
        sans: ["'Space Grotesk'", "sans-serif"],
      },
      boxShadow: {
        brutal:    "4px 4px 0px #0A0A0A",
        "brutal-lg": "6px 6px 0px #0A0A0A",
        "brutal-xl": "8px 8px 0px #0A0A0A",
        "brutal-2xl": "10px 10px 0px #0A0A0A",
      },
      borderWidth: { "3": "3px" },
    },
  },
  plugins: [],
};

export default config;
