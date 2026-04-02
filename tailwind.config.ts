import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          1: '#0C0D10',
          2: '#111318',
          3: '#181B22',
          4: '#1E2230',
        },
        border: {
          DEFAULT: '#252A38',
          2: '#2E3548',
        },
        accent: {
          DEFAULT: '#D50C2D',
          dim: '#8B1020',
          glow: 'rgba(213,12,45,0.15)',
        },
        status: {
          running: '#1ED97A',
          off: '#525E78',
          starting: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Config
