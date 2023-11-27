/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      phone: "320px",
      tablet: "640px",
      laptop: "1024px",
      desktop: "1281px",
      "lg-desktop": "1536px",
    },
    fontSize: {
      sm: ["14px", "20px"],
      base: ["16px", "24px"],
      lg: ["20px", "28px"],
      xl: ["24px", "32px"],
      "2xl": ["28px", { lineHeight: "36px", fontWeight: "bold" }],
      "3xl": ["32px", { lineHeight: "40px", fontWeight: "bold" }],
    },
    extend: {
      keyframes: {
        "login-hide": {
          "0%": { opacity: 1 },
          "50%": { transform: "translateX(-22rem)", opacity: 0.5 },
          "100%": { opacity: 0 },
        },
        "login-show": {
          "0%": { opacity: 0 },
          "50%": { transform: "translateX(-22rem)", opacity: 0.5 },
          "100%": { opacity: 1 },
        },
        "signup-hide": {
          "0%": { opacity: 1 },
          "50%": { transform: "translateX(22rem)", opacity: 0.5 },
          "100%": { opacity: 0 },
        },
        "signup-show": {
          "0%": { opacity: 0 },
          "50%": { transform: "translateX(22rem)", opacity: 0.5 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        "login-hide": "login-hide 1s linear 1",
        "login-show": "login-show 1s linear 1",
        "signup-hide": "signup-hide 1s linear 1",
        "signup-show": "signup-show 1s linear 1",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
  ],
};
