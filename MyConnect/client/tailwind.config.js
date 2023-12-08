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

        "registration-show": {
          "0%": {
            transform: "translateX(-800px) rotateY(30deg) scale(0)",
            "transform-origin": "-100% 50%",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0) rotateY(0) scale(1)",
            "transform-origin": "1800px 50%",
            opacity: 1,
          },
        },
        "registration-hide": {
          "0%": {
            transform: "translateX(0) rotateY(0) scale(1)",
            "transform-origin": "-1800px 50%",
            opacity: 1,
          },
          "100%": {
            transform: "translateX(1000px) rotateY(-30deg) scale(0)",
            "transform-origin": "-100% 50%",
            opacity: 0,
          },
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
            width: "calc(100%/4)",
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
            width: "calc(100%/4)",
          },
          "100%": {
            transform: "rotateX(0)",
            width: "calc(100%/4)",
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
        // "custom-ping": {
        //   "0%": {
        //     transform: "scale(0.2)",
        //     opacity: 0.8,
        //   },
        //   "25%": {
        //     transform: "scale(0.7)",
        //   },
        //   "50%": {
        //     transform: "scale(1.2)",
        //   },
        //   "75%": {
        //     transform: "scale(1.7)",
        //   },
        //   "100%": {
        //     transform: "scale(2.2)",
        //     opacity: 0,
        //   },
        // },
        "custom-spin": {
          "0%": {
            transform: "scale(1) rotate(0)",
          },
          "50%": {
            transform: "scale(1.5) rotate(90deg)",
          },
          "100%": {
            transform: "scale(1) rotate(180deg)",
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
        "registration-show": "registration-show 1s linear 1",
        "registration-hide": "registration-hide 1s linear 1",
        "information-hide": "information-hide .5s both",
        "information-show": "information-show .5s both",
        logo: "logo 2s infinite",
        spin: "custom-spin .5s",
        "flip-scale-down-vertical": "flip-scale-down-vertical .5s both",
        "flip-scale-up-vertical": "flip-scale-up-vertical .5s both",
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
