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
    // fontSize: {
    //   sm: ["14px", "20px"],
    //   base: ["16px", "24px"],
    //   lg: ["20px", "28px"],
    //   xl: ["24px", "32px"],
    //   "2xl": ["28px", { lineHeight: "36px", fontWeight: "bold" }],
    //   "3xl": ["32px", { lineHeight: "40px", fontWeight: "bold" }],
    //   "4xl": ["36px", { lineHeight: "44px", fontWeight: "bold" }],
    //   "5xl": ["40px", { lineHeight: "48px", fontWeight: "bold" }],
    //   "6xl": ["43px", { lineHeight: "52px", fontWeight: "bold" }],
    //   "7xl": ["48px", { lineHeight: "56px", fontWeight: "bold" }],
    //   "8xl": ["52px", { lineHeight: "60px", fontWeight: "bold" }],
    //   "9xl": ["56px", { lineHeight: "64px", fontWeight: "bold" }],
    //   "10xl": ["60px", { lineHeight: "68px", fontWeight: "bold" }],
    // },
    fontSize: {
      xs: "1.2rem",
      sm: "1.4rem",
      base: "1.6rem",
      md: "1.8rem",
      lg: "2rem",
      xl: "2.4rem",
      "2xl": ["2.8rem", { fontWeight: "bold" }],
      "3xl": ["3.2rem", { fontWeight: "bold" }],
      "4xl": ["3.6rem", { fontWeight: "bold" }],
      "5xl": ["4.0rem", { fontWeight: "bold" }],
      "6xl": ["4.3rem", { fontWeight: "bold" }],
      "7xl": ["4.8rem", { fontWeight: "bold" }],
      "8xl": ["5.2rem", { fontWeight: "bold" }],
      "9xl": ["5.6rem", { fontWeight: "bold" }],
      "10xl": ["6rem", { fontWeight: "bold" }],
    },
    extend: {
      backgroundImage: () => ({
        "gradient-radial-to-tr":
          "radial-gradient(115% 90% at 0% 100%, var(--tw-gradient-stops))",
        "gradient-radial-to-tc":
          "radial-gradient(115% 90% at 50% 120%, var(--tw-gradient-stops))",
        "gradient-radial-to-tl":
          "radial-gradient(115% 90% at 100% 100%, var(--tw-gradient-stops))",
        "gradient-radial-to-br":
          "radial-gradient(90% 115% at 0% 0%, var(--tw-gradient-stops))",
        "gradient-radial-to-bc":
          "radial-gradient(90% 115% at 50% -50%, var(--tw-gradient-stops))",
        "gradient-radial-to-bl":
          "radial-gradient(90% 115% at 100% 0%, var(--tw-gradient-stops))",
      }),
      keyframes: {
        // "login-hide": {
        //   "0%": { opacity: 1 },
        //   "50%": { transform: "translateX(-22rem)", opacity: 0.5 },
        //   "100%": { opacity: 0 },
        // },
        // "login-show": {
        //   "0%": { opacity: 0 },
        //   "50%": { transform: "translateX(-22rem)", opacity: 0.5 },
        //   "100%": { opacity: 1 },
        // },
        // "signup-hide": {
        //   "0%": { opacity: 1 },
        //   "50%": { transform: "translateX(22rem)", opacity: 0.5 },
        //   "100%": { opacity: 0 },
        // },
        // "signup-show": {
        //   "0%": { opacity: 0 },
        //   "50%": { transform: "translateX(22rem)", opacity: 0.5 },
        //   "100%": { opacity: 1 },
        // },
        // "login-show": {
        //   "0%": {
        //     transform: "translateX(-800px) rotateY(-30deg) scale(6.5)",
        //     "transform-origin": "200% 50%",
        //     opacity: 0,
        //   },
        //   "100%": {
        //     transform: "translateX(0) rotateY(0) scale(1)",
        //     "transform-origin": "-600px 50%",
        //     opacity: 1,
        //   },
        // },

        // "login-show": {
        //   "0%": {
        //     transform: "translateX(-800px) rotateY(30deg) scale(0)",
        //     "transform-origin": "-100% 50%",
        //     opacity: 0,
        //   },
        //   "100%": {
        //     transform: "translateX(0) rotateY(0) scale(1)",
        //     "transform-origin": "1800px 50%",
        //     opacity: 1,
        //   },
        // },
        // "login-hide": {
        //   "0%": {
        //     transform: "translateX(0) rotateY(0) scale(1)",
        //     "transform-origin": "-1800px 50%",
        //     opacity: 1,
        //   },
        //   "100%": {
        //     transform: "translateX(1000px) rotateY(-30deg) scale(0)",
        //     "transform-origin": "-100% 50%",
        //     opacity: 0,
        //   },
        // },
        // "signup-show": {
        //   "0%": {
        //     transform: "translateX(-800px) rotateY(30deg) scale(0)",
        //     "transform-origin": "-100% 50%",
        //     opacity: 0,
        //   },
        //   "100%": {
        //     transform: "translateX(0) rotateY(0) scale(1)",
        //     "transform-origin": "1800px 50%",
        //     opacity: 1,
        //   },
        // },
        // "signup-hide": {
        //   "0%": {
        //     transform: "translateX(0) rotateY(0) scale(1)",
        //     "transform-origin": "-1800px 50%",
        //     opacity: 1,
        //   },
        //   "100%": {
        //     transform: "translateX(1000px) rotateY(-30deg) scale(0)",
        //     "transform-origin": "-100% 50%",
        //     opacity: 0,
        //   },
        // },

        "show-signup": {
          "0%": {
            transform: "translateX(-50%)",
          },
          "10%": {
            transform: "translateX(-200%)",
            opacity: 0,
          },
          "60%": {
            transform: "translateX(250%)",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: 1,
          },
        },

        "registration-show": {
          "0%": {
            transform: "translateX(-80rem) rotateY(30deg) scale(0)",
            "transform-origin": "-100% 50%",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0) rotateY(0) scale(1)",
            "transform-origin": "240rem 50%",
            opacity: 1,
          },
        },
        "registration-hide": {
          "0%": {
            transform: "translateX(0) rotateY(0) scale(1)",
            "transform-origin": "-220rem 50%",
            opacity: 1,
          },
          "100%": {
            transform: "translateX(100rem) rotateY(-30deg) scale(0)",
            "transform-origin": "-100% 50%",
            opacity: 0,
          },
        },

        "information-hide": {
          "50%": {
            opacity: 0,
          },
          "100%": {
            "flex-grow": "0",
            opacity: 0,
            "margin-right": 0,
          },
        },
        "information-show": {
          "0%": {
            "flex-grow": "0",
            opacity: 0,
          },
          "30%": {
            opacity: 0,
          },
          "100%": {
            "flex-grow": "1",
            opacity: 1,
          },
        },

        logo: {
          "0%": {
            transform: "translateX(-22px) translateY(-22px)",
            "animation-timing-function": "linear",
          },
          "19%": {
            transform: "translateX(-10px) translateY(-16px)",
            "animation-timing-function": "linear",
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
        "information-hide-arrow": {
          "0%": {
            transform: "scale(1) rotate(0)",
          },
          "80%": {
            transform: "scale(1.5) rotate(-90deg)",
          },
          "100%": {
            transform: "scale(1) rotate(-180deg)",
          },
        },
        "information-show-arrow": {
          "0%": {
            transform: "scale(1) rotate(180deg)",
          },
          "50%": {
            transform: "scale(1.5) rotate(270deg)",
          },
          "100%": {
            transform: "scale(1) rotate(360deg)",
          },
        },
        "flip-scale-down-vertical": {
          "0%": {
            transform: "scale(1) rotateY(0)",
          },
          "50%": {
            transform: "scale(0.4) rotateY(90deg)",
            opacity: 0,
          },
          "100%": {
            transform: "scale(1) rotateY(0)",
            opacity: 0,
            "z-index": 0,
          },
        },
        "flip-scale-up-vertical": {
          "0%": {
            transform: "scale(1) rotateY(0)",
            opacity: 0,
          },
          "50%": {
            transform: "scale(0.4) rotateY(-90deg)",
            opacity: 0,
          },
          "100%": {
            transform: "scale(1) rotateY(0)",
            opacity: 1,
            "z-index": 10,
          },
        },
      },
      animation: {
        // "login-hide": "login-hide 1s linear 1",
        // "login-show": "login-show 1s linear 1",
        // "signup-hide": "signup-hide 1s linear 1",
        // "signup-show": "signup-show 1s linear 1",
        "registration-show": "registration-show 1s linear 1 both",
        "registration-hide": "registration-hide 1s linear 1 both",
        "information-hide": "information-hide .5s both",
        "information-show": "information-show .5s both",
        "information-hide-arrow": "information-hide-arrow .5s both",
        "information-show-arrow": "information-show-arrow .5s both",
        logo: "logo 2s infinite",
        "flip-scale-down-vertical": "flip-scale-down-vertical .5s both",
        "flip-scale-up-vertical": "flip-scale-up-vertical .5s both",
        "show-signup": "show-signup 15s both infinite",
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
