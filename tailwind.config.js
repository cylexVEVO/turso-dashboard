/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          from: {opacity: 0},
          to: {opacity: 1}
        }
      },
      animation: {
        fadeIn: "fadeIn 150ms ease"
      },
      colors: {
        bgLight: "#f3f3f3",
        bgDark: "#161616",
        borderLight: "#e4e4e4",
        borderDark: "#2c2c2c",
        accentLight: "#ffffff",
        accentDark: "#1b1b1b",
        accent2Light: "#eeeeee",
        accent2Dark: "#212121"
      }
    },
  },
  plugins: [],
}
