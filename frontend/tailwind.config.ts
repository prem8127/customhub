import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#381425",
        mist: "#f7eff1",
        steel: "#7d5b6b",
        line: "rgba(82, 18, 42, 0.12)",
        brand: "#8f1d48",
        brandSoft: "#c14f72"
      },
      boxShadow: {
        soft: "0 28px 88px rgba(85, 18, 44, 0.14)",
        card: "0 18px 46px rgba(85, 18, 44, 0.11)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(143, 29, 72, 0.24), transparent 35%), radial-gradient(circle at 85% 15%, rgba(240, 188, 205, 0.26), transparent 28%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" }
        }
      },
      animation: {
        drift: "drift 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
