/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0e0f12',
          surface: '#13151a',
          border: '#2a2d35',
          hover: '#1a1d24',
          text: '#e4e4e7',
          muted: '#71717a',
        },
        accent: '#4ade80',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
