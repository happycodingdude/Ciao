/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'phone': '320px',
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
    },
    fontSize: {
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['20px', '28px'],
      xl: ['24px', '32px'],
      '2xl': ['28px', { lineHeight: '36px', fontWeight: 'bold' }],
      '3xl': ['32px', { lineHeight: '40px', fontWeight: 'bold' }]
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
}

