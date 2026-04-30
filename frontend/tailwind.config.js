/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00D4FF',
          dark: '#0099CC',
          glow: 'rgba(0,212,255,0.15)'
        },
        accent: '#FF6B35',
        surface: {
          DEFAULT: '#0F0F14',
          card: '#16161E',
          elevated: '#1E1E2A',
          border: '#2A2A3A'
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,212,255,0.25)',
        'glow-sm': '0 0 10px rgba(0,212,255,0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4)'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.5)' } }
      }
    }
  },
  plugins: []
};
