/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        void: '#080808',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        border: '#2a2a2a',
        text: '#e8e6e0',
        'text-muted': '#666660',
        accent: 'var(--color-accent, #c8a96e)',
        'accent-dim': 'var(--color-accent-dim, #7a6540)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
