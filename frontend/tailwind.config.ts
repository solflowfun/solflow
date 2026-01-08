import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cream / Paper backgrounds
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F8F1E7',  // Base cream
          300: '#F2E6D6',  // Elevated cream
          400: '#E8D7C2',  // Divider lines
          500: '#D9C4A9',
          600: '#C4A882',
          700: '#A68B62',
          800: '#7A6548',
          900: '#4D3F2D',
        },
        // Warm charcoal text
        charcoal: {
          50: '#F7F6F5',
          100: '#ECEAE8',
          200: '#D9D5D1',
          300: '#B3ADA6',
          400: '#8C847A',
          500: '#5C5549',
          600: '#3D3832',
          700: '#2A2622',
          800: '#1C1713',  // Primary text
          900: '#0E0B09',
        },
        // Ember gradient stops
        ember: {
          red: '#D5522E',
          orange: '#E08B46',
          gold: '#C47809',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-clash-display)', 'var(--font-inter)', 'system-ui'],
        mono: ['var(--font-jetbrains-mono)', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ember-gradient': 'linear-gradient(135deg, #D5522E 0%, #E08B46 60%, #C47809 100%)',
        'ember-gradient-soft': 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 60%, rgba(196, 120, 9, 0.06) 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(28, 23, 19, 0.04)',
        'soft-md': '0 4px 16px rgba(28, 23, 19, 0.06)',
        'soft-lg': '0 8px 32px rgba(28, 23, 19, 0.08)',
        'ember-glow': '0 4px 24px rgba(213, 82, 46, 0.15)',
        'ember-glow-lg': '0 8px 40px rgba(213, 82, 46, 0.2)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.08' },
          '50%': { opacity: '0.12' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
