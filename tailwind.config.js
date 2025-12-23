/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#9333ea',
          pink: '#ec4899',
          blue: '#3b82f6',
          green: '#10b981',
        }
      }
    }
  },
  plugins: []
}
