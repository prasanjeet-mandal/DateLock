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
        campus: {
          dark: '#0e0612',
          surface: '#150a1b',
          card: 'rgba(26, 12, 32, 0.75)',
          border: 'rgba(255, 105, 180, 0.15)',
          pink: '#ff2d87',
          rose: '#ff007f',
          blush: '#ff77a9',
          hotpink: '#ff1493',
          fuchsia: '#d946ef',
          wine: '#4a0e2e',
          soft: '#fbcfe8',
          gold: '#ffd700',
        }
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        lg: '20px',
        xl: '32px',
      },
      boxShadow: {
        'glow-pink': '0 0 30px -4px rgba(255, 45, 135, 0.55)',
        'glow-rose': '0 0 30px -4px rgba(255, 0, 127, 0.55)',
        'glow-blush': '0 0 25px -4px rgba(255, 119, 169, 0.45)',
        'glow-fuchsia': '0 0 30px -4px rgba(217, 70, 239, 0.5)',
        '3d': '0 20px 45px -12px rgba(14, 6, 18, 0.8), 0 0 25px 0 rgba(255, 45, 135, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
