import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#1E7C4B', dark: '#155C37', light: '#E8F5EE' },
        gold: { DEFAULT: '#D4881E', light: '#FDF3E3' },
        cream: '#FAF8F3',
        paper: '#F3EFE6',
        ink: '#111827',
        muted: '#4B5563',
        line: '#E7E3D9',
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04)',
        card: '0 10px 34px rgba(17,24,39,0.08)',
        lift: '0 24px 60px rgba(17,24,39,0.14)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dot: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fadeup: 'fadeup 0.6s ease both',
        dot: 'dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
