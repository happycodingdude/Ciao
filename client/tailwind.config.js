/** @type {import('tailwindcss').Config} */
// const plugin = require("tailwindcss/plugin");
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // screens: {
    //   phone: "320px",
    //   tablet: "640px",
    //   laptop: "1024px",
    //   "laptop-lg": "1400px",
    //   desktop: "1920px",
    // },
    screens: {
      phone: "375px", // Modern smartphones (e.g., iPhone 13, Samsung S22)
      "phone-lg": "430px", // Large smartphones (e.g., iPhone 15 Pro Max)
      tablet: "768px", // Standard tablets (e.g., iPad Mini, Samsung Tab)
      "tablet-lg": "900px", // Large tablets (e.g., iPad Pro 11-inch)
      laptop: "1280px", // Mid-size laptops and ultrabooks
      "laptop-md": "1440px", // Medium high-res laptops (MacBook 14-inch)
      "laptop-lg": "1600px", // Larger high-res laptops (MacBook Pro 16-inch)
      desktop: "1920px", // Standard full HD monitors
      "desktop-lg": "2560px", // 2K+ high-resolution monitors
      "desktop-4k": "3840px", // 4K screens for ultra-high-res displays
    },
    // fontSize: {
    //   "3xs": ".8rem",
    //   "2xs": "1rem",
    //   xs: "1.2rem",
    //   sm: "1.4rem",
    //   base: "1.6rem",
    //   md: "1.8rem",
    //   lg: "2rem",
    //   xl: "2.4rem",
    //   "2xl": ["2.8rem", { fontWeight: "bold" }],
    //   "3xl": ["3.2rem", { fontWeight: "bold" }],
    //   "4xl": ["3.6rem", { fontWeight: "bold" }],
    //   "5xl": ["4.0rem", { fontWeight: "bold" }],
    //   "6xl": ["4.3rem", { fontWeight: "bold" }],
    //   "7xl": ["4.8rem", { fontWeight: "bold" }],
    //   "8xl": ["5.2rem", { fontWeight: "bold" }],
    //   "9xl": ["5.6rem", { fontWeight: "bold" }],
    //   "10xl": ["6rem", { fontWeight: "bold" }],
    // },
    fontSize: {
      "3xs": "0.75rem", // ~12px - Extra small text for captions/hints
      "2xs": "0.875rem", // ~14px - Small text for footnotes, helper text
      xs: "1rem", // ~16px - Standard small text
      sm: "1.125rem", // ~18px - Default text size for readability
      base: "1.25rem", // ~20px - Modern default body text size
      md: "1.5rem", // ~24px - Slightly larger body text for readability
      lg: "1.75rem", // ~28px - Used for subtitles or headings
      xl: "2rem", // ~32px - Small headings or callout text
      "2xl": "2.5rem", // ~40px - Section headings
      "3xl": "3rem", // ~48px - Large section headings
      "4xl": "3.5rem", // ~56px - Hero headings
      "5xl": "4rem", // ~64px - Display text for main sections
      "6xl": "4.5rem", // ~72px - Standout hero text
      "7xl": "5rem", // ~80px - Large banners or key highlights
      "8xl": "6rem", // ~96px - Huge headlines
      "9xl": "7rem", // ~112px - Massive display text
      "10xl": "8rem", // ~128px - Super large hero headlines
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        neo: {
          blue: "#2563eb",
          purple: "#8b5cf6",
          pink: "#ec4899",
          orange: "#f97316",
          green: "#10b981",
          teal: "#14b8a6",
          red: "#ef4444",
        },
        pastel: {
          blue: "#a5c8fd",
          purple: "#c5b3ff",
          pink: "#ffb8d9",
          green: "#a7f3d0",
          yellow: "#fde68a",
          orange: "#fed7aa",
          teal: "#a5f3f3",
          red: "#fca5a5",
        },
      },
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
        borderPulse: {
          "0%, 100%": {
            borderColor: "rgba(59, 130, 246, 0.5)",
          },
          "50%": {
            borderColor: "rgba(59, 130, 246, 1)",
          },
        },
        scaleIn: {
          "0%": {
            transform: "scale(0.9)",
            opacity: 0,
          },
          "100%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
        slideIn: {
          "0%": {
            transform: "translateX(-10px)",
            opacity: 0,
          },
          "100%": {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
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
        "waving-text": {
          "0%,40%,100%": {
            transform: "translateY(0)",
          },
          "20%": {
            transform: "translateY(-7rem)",
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

        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 3s infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "border-pulse": "borderPulse 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      // matchUtilities(
      //   {
      //     "text-shadow": (value) => ({
      //       textShadow: value,
      //     }),
      //   },
      //   { values: theme("textShadow") },
      // );
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        },
      );
    }),
  ],
};
