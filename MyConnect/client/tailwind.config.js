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
        // "information-hide": {
        //   "100%": {
        //     transform: "rotate(-540deg)",
        //     scale: 0,
        //     opacity: 0,
        //   },
        // },
        // "information-show": {
        //   "0%": {
        //     transform: "rotate(-540deg)",
        //     scale: 0,
        //     opacity: 0,
        //   },
        //   "100%": {
        //     scale: 1,
        //     opacity: 1,
        //   },
        // },
        "information-hide": {
          "0%": {
            transform: "rotateX(0)",
          },
          "50%": {
            transform: "rotateX(89deg)",
            width: "clamp(30rem,20vw,40rem)",
          },
          "100%": {
            transform: "rotateX(90deg)",
            width: 0,
          },
        },
        "information-show": {
          "0%": {
            transform: "rotateX(90deg)",
            width: 0,
          },
          "50%": {
            transform: "rotateX(89deg)",
            width: "clamp(30rem,20vw,40rem)",
          },
          "100%": {
            transform: "rotateX(0)",
            width: "clamp(30rem,20vw,40rem)",
          },
        },
        logo: {
          "0%": {
            transform: "translateX(-22px) translateY(-22px)",
            "animation-timing-function": "linear",
          },
          "19%": {
            transform: "translateX(-10px) translateY(-16px)",
            "animation-timing-function": "ease-in",
          },
          "38%": {
            transform: "translateX(0) translateY(0)",
            "animation-timing-function": "ease-out",
          },
          "55%": {
            transform: "translateY(-15px)",
            "animation-timing-function": "ease-in",
          },
          "72%": {
            transform: "translateY(0)",
            "animation-timing-function": "ease-out",
          },
          "81%": {
            transform: "translateY(-10px)",
            "animation-timing-function": "ease-in",
          },
          "90%": {
            transform: "translateY(0)",
            "animation-timing-function": "ease-out",
          },
          "95%": {
            transform: "translateY(-5px)",
            "animation-timing-function": "ease-in",
          },
          "100%": {
            transform: "translateY(0)",
            // "animation-timing-function": "ease-out",
          },
        },
      },
      animation: {
        "login-hide": "login-hide 1s linear 1",
        "login-show": "login-show 1s linear 1",
        "signup-hide": "signup-hide 1s linear 1",
        "signup-show": "signup-show 1s linear 1",
        "information-hide": "information-hide .5s both",
        "information-show": "information-show .5s both",
        logo: "logo 1.5s infinite",
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
