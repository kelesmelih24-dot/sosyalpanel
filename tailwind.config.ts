import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0D0716",
        panel: "#160B26",
        panel2: "#1E1033",
        line: "#33224F",
        ink: "#F4F1FB",
        mute: "#A79BC4",
        magenta: "#FF2E9A",
        cyan: "#00E5FF",
        amber: "#FFB020",
        violet: "#7A5CFF",
        // Public storefront palette (light, pink-forward — matches brand ref)
        brand: "#E6106B",
        brandDark: "#B90E57",
        brandSoft: "#FDEAF1",
        paper: "#FFFFFF",
        blush: "#FDF2F5",
        slate: "#1F2937",
        slateMute: "#6B7280",
        border2: "#F1DCE4",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "grad-hero":
          "radial-gradient(80% 60% at 15% 0%, rgba(122,92,255,0.35) 0%, rgba(13,7,22,0) 60%), radial-gradient(70% 50% at 100% 20%, rgba(255,46,154,0.25) 0%, rgba(13,7,22,0) 55%)",
        "grad-card": "linear-gradient(155deg, #1E1033 0%, #160B26 100%)",
        "grad-blush": "radial-gradient(120% 100% at 50% 0%, #FCE4EC 0%, #FDF2F5 60%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
