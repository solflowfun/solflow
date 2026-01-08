import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F7F4EF',
          dark: '#EDE8E0',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#4A4A4A',
          muted: '#8A8A8A',
        },
        accent: {
          mint: '#8CCBBF',
          teal: '#50908D',
          lavender: '#817CCD',
          coral: '#E08B46',
          'burnt-orange': '#D5522E',
          gold: '#C47809',
          peach: '#ECC499',
        },
      },
      fontFamily: {
        editorial: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
