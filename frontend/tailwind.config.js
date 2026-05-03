/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: ({ opacityValue }) => {
            if (opacityValue !== undefined) {
              return `color-mix(in srgb, var(--brand), transparent ${100 - (opacityValue * 100)}%)`;
            }
            return 'var(--brand)';
          },
          dark:    'color-mix(in srgb, var(--brand), black 20%)',
          light:   'color-mix(in srgb, var(--brand), white 20%)',
          glow:    'color-mix(in srgb, var(--brand), transparent 85%)'
        },
        accent:  '#FF6B35',
        surface: {
          DEFAULT:  '#0A0A0F',
          card:     '#12121A',
          elevated: '#1A1A26',
          border:   '#222232'
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow:         '0 0 20px color-mix(in srgb, var(--brand), transparent 75%)',
        'glow-sm':    '0 0 10px color-mix(in srgb, var(--brand), transparent 85%)',
        'glow-lg':    '0 0 45px color-mix(in srgb, var(--brand), transparent 65%)',
        card:         '0 4px 24px rgba(0,0,0,0.4)',
        'brand-ring': '0 0 0 2px color-mix(in srgb, var(--brand), transparent 60%)'
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.5s ease-out both',
        'slide-in-left': 'slideInLeft 0.5s ease-out both',
        'scale-in':      'scaleIn 0.4s ease-out both',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSub 1.8s ease-in-out infinite',
        'spin-slow':     'spin 10s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 9s ease-in-out infinite',
        'float-slower':  'float 12s ease-in-out infinite',
        'shimmer-fast':  'shimmer 1.5s linear infinite',
        'shimmer-slow':  'shimmer 3s linear infinite',
        'scan':          'scan 4s linear infinite',
        'star-twinkle':  'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        float:       { '0%, 100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-20px) rotate(5deg)' } },
        shimmer:     { '100%': { transform: 'translateX(200%)' } },
        scan:        { '0%': { top: '0%' }, '100%': { top: '100%' } },
        twinkle:     { '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' }, '50%': { opacity: '1', transform: 'scale(1.2)' } },
        fadeIn:      { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.88)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseGlow:   { '0%,100%': { boxShadow: '0 0 10px rgba(0,212,255,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.55)' } },
        bounceSub:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
      }
    }
  },
  plugins: []
};
