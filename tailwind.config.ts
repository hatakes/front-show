import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emeraldLuxury: '#0b2f26',
        goldLuxury: '#d6b25e'
      },
      boxShadow: {
        glow: '0 0 30px rgba(214, 178, 94, 0.45)'
      }
    }
  },
  plugins: []
} satisfies Config;
