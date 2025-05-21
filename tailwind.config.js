/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'Arial', 'sans-serif'],
      },
      colors: {
        corporate: {
          blue: '#0C3B5E',
          lightBlue: '#1965A8',
          secondary: '#00B2FF', // Bright blue from Resolia logo
          accent: '#0096D6', // Medium blue from Resolia logo
          light: '#E6F7FF', // Light blue for backgrounds
          dark: '#001F3F', // Dark blue for text
          red: '#A62A1C',
          yellow: '#DFA921',
          purple: '#2A1CA6',
          green: '#005C14',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};