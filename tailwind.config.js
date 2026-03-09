/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/frontend/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        vault: {
          bg:      '#0b0d14',
          surface: '#12151f',
          card:    '#181c28',
          border:  '#1e2435',
          muted:   '#2a3045',
          amber:   '#d4a853',
          gold:    '#f0c060',
          cream:   '#f5efe0',
          teal:    '#4ecdc4',
          red:     '#e05c5c',
          green:   '#5cb85c',
        },
      },
    },
  },
  plugins: [],
};
