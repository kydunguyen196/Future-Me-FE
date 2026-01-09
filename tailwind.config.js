/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: '#ffffff',
          text: '#111827',
          primary: '#3b82f6',
        },
        keyframes: {
          "caret-blink": {
            "0%,70%,100%": { opacity: "1" },
            "20%,50%": { opacity: "0" },
          },
        },
        animation: {
          "caret-blink": "caret-blink 1.25s ease-out infinite",
        },
        animationDelay: {
          '1000': '1000ms',
          '2000': '2000ms',
          '3000': '3000ms',
        },
      },
    },
    plugins: [
      function({ addUtilities }) {
        const newUtilities = {
          '.animation-delay-1000': {
            'animation-delay': '1000ms',
          },
          '.animation-delay-2000': {
            'animation-delay': '2000ms',
          },
          '.animation-delay-3000': {
            'animation-delay': '3000ms',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  } 