import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: '#c9a87c',
        card: 'rgb(15 15 18)',
        border: 'rgb(38 38 42)',
        muted: 'rgb(115 115 122)',
      },
    },
  },
  plugins: [],
} satisfies Config
