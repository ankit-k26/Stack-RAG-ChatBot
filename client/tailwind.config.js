/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Primary UI font — clean, modern, non-default
        sans: ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // AI reply / terminal style — Deep Violet Terminal influence
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
      },
      colors: {
        // ── Obsidian Glass dark surfaces ──────────────────────────
        obsidian: {
          DEFAULT: '#0F0F12',   // sidebar dark bg
          raised: '#141418',   // main chat area dark bg
          overlay: '#1A1A22',  // cards, input container dark
          bubble: '#1C1C2E',   // AI bubble bg (violet-tinted dark)
        },
        // ── Teal accent (single accent, used everywhere) ──────────
        accent: {
          DEFAULT: '#00C9B1',
          dim: '#009E8D',
        },
        // ── Light mode surfaces ───────────────────────────────────
        cloud: {
          DEFAULT: '#FFFFFF',
          raised: '#F4F4F7',
          overlay: '#EAEAF0',
        },
      },
      boxShadow: {
        // Teal glow — for interactive elements
        'teal-glow': '0 0 0 1px rgba(0,201,177,0.25), 0 0 16px rgba(0,201,177,0.1)',
        // Teal focus ring — for input containers
        'teal-focus': '0 0 0 2px rgba(0,201,177,0.35), 0 0 24px rgba(0,201,177,0.12)',
        // Violet bubble shadow
        'violet-card': '0 4px 24px rgba(109,40,217,0.2)',
        card: '0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12)',
        lift: '0 8px 40px rgba(0,0,0,0.45)',
      },
      keyframes: {
        // Message entrance
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Typing indicator dots (violet)
        dotBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '30%': { transform: 'translateY(-5px)', opacity: '1' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        dotBounce: 'dotBounce 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
