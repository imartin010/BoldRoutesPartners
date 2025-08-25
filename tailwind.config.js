/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '360px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        // Monochrome brand palette
        brand: {
          bg: 'var(--brand-bg)',
          fg: 'var(--brand-fg)',
          muted: 'var(--brand-muted)',
          border: 'var(--brand-border)',
          card: 'var(--brand-card)',
          overlay: 'var(--brand-overlay)',
        },
        // Legacy elegant grays (for gradual migration)
        'gray-elegant': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '32px' }],
        '2xl': ['24px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '48px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '680': '680px',
      },
      boxShadow: {
        'elegant': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elegant-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elegant-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'focus': '0 0 0 2px rgba(0, 0, 0, 0.8)',
        'focus-light': '0 0 0 2px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
