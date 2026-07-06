import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#1E7C4B', dark: '#155C37', light: '#E8F5EE' },
        gold: { DEFAULT: '#C08329', light: '#FBF1DE', bright: '#E8A63D' },
        cream: '#FBF9F4',
        paper: '#F2ECE0',
        ink: '#132018',
        muted: '#55605A',
        line: '#E6E1D4',
        whatsapp: '#25D366',
        forest: { DEFAULT: '#0B241A', 700: '#123528', 600: '#1A4634' },
        sand: '#EFE8DA',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'Cambria', 'serif'],
      },
      letterSpacing: { tightest: '-0.045em' },
      boxShadow: {
        soft: '0 1px 3px rgba(19,32,24,0.05), 0 1px 2px rgba(19,32,24,0.04)',
        card: '0 18px 44px -18px rgba(11,36,26,0.20)',
        lift: '0 40px 80px -24px rgba(11,36,26,0.34)',
        glow: '0 0 0 1px rgba(192,131,41,0.25), 0 20px 60px -18px rgba(192,131,41,0.45)',
      },
      borderRadius: { xl: '14px', '2xl': '20px', '3xl': '30px' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        fadeup: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        rise: { '0%': { opacity: '0', transform: 'translateY(115%)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        draw: { '0%': { strokeDashoffset: '620' }, '100%': { strokeDashoffset: '0' } },
        fly: { '0%': { offsetDistance: '0%', opacity: '0' }, '12%': { opacity: '1' }, '100%': { offsetDistance: '100%', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        dot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        pop: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fadeup: 'fadeup 0.6s ease both',
        rise: 'rise 0.9s cubic-bezier(0.22,1,0.36,1) both',
        draw: 'draw 1.8s cubic-bezier(0.22,1,0.36,1) 0.3s both',
        fly: 'fly 2s cubic-bezier(0.5,0,0.2,1) 0.9s both',
        shimmer: 'shimmer 2.6s linear infinite',
        dot: 'dot 2s ease-in-out infinite',
        pop: 'pop 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
