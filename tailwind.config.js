/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // "Stacks" palette — an archive/library-inspired identity for a
        // document-retrieval chatbot. Warm paper + deep ink, gold as the
        // single retrieval accent (never the default terracotta/cream combo).
        paper: {
          DEFAULT: '#F6F3EC',
          soft: '#EFEBE1',
        },
        ink: {
          DEFAULT: '#1B1A1E',
          soft: '#242329',
          muted: '#3A383F',
        },
        gold: {
          DEFAULT: '#B98A2E',
          soft: '#D9B36C',
          dim: '#8A6A24',
        },
        sage: {
          DEFAULT: '#4F7969',
          soft: '#7FA396',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 26, 30, 0.06), 0 4px 12px rgba(27, 26, 30, 0.05)',
        lift: '0 8px 24px rgba(27, 26, 30, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
