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
        // Cream / Parchment backgrounds
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#FAF5EC',
          300: '#F6F1E8',
          400: '#EDE6D9',
          500: '#E0D6C5',
          600: '#C9BDAA',
          700: '#A99D8A',
          800: '#857A6A',
          900: '#5C544A',
        },
        // Warm charcoal text
        charcoal: {
          50: '#F5F4F3',
          100: '#E8E6E4',
          200: '#D1CDCA',
          300: '#A9A39D',
          400: '#7A736B',
          500: '#524D47',
          600: '#3D3934',
          700: '#2D2A26',
          800: '#1E1A16',
          900: '#0F0D0B',
        },
        // Ember gradient stops
        ember: {
          red: '#D5522E',
          orange: '#E08B46',
          gold: '#C47809',
        },
        // Secondary accents (limited use)
        accent: {
          teal: '#50908D',
          lavender: '#817CCD',
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        display: ['var(--font-clash-display)', 'var(--font-space-grotesk)', 'system-ui'],
        mono: ['var(--font-jetbrains-mono)', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ember-gradient': 'linear-gradient(135deg, #D5522E 0%, #E08B46 50%, #C47809 100%)',
        'ember-gradient-horizontal': 'linear-gradient(90deg, #D5522E 0%, #E08B46 50%, #C47809 100%)',
        'ember-gradient-vertical': 'linear-gradient(180deg, #D5522E 0%, #E08B46 50%, #C47809 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(30, 26, 22, 0.06)',
        'soft-lg': '0 4px 16px rgba(30, 26, 22, 0.08)',
        'ember-glow': '0 4px 24px rgba(213, 82, 46, 0.15)',
        'ember-glow-lg': '0 8px 40px rgba(213, 82, 46, 0.2)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
};

export default config;
