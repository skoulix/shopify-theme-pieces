/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './layout/**/*.liquid',
    './templates/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './blocks/**/*.liquid',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'page': 'var(--page-max-width, 1280px)',
      },
    },
  },
  plugins: [],
};
