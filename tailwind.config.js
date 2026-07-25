/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'primary': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'heading': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Brand redesign fonts (self-hosted, see src/react-app/brand-fonts.css).
        // New keys only — existing 'sans'/'primary'/'heading' above are untouched so
        // any page not yet ported keeps the original system-font stack.
        'brand-sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'brand-serif': ['"Fraunces Variable"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Brand redesign palette (from Home/Assessment/RelocationHub/Results mockups).
        // Namespaced under "brand" so it never collides with existing gray/blue/purple
        // utility classes used throughout the rest of the site.
        brand: {
          bg: '#ffffff',
          surface: '#faf5e9',
          'surface-2': '#f3ead3',
          ink: '#0b2545',
          'ink-2': '#13315c',
          muted: '#5a6a86',
          accent: '#14b8a6',
          'accent-2': '#5eead4',
          'accent-ink': '#063d38',
          border: '#e6dcc0',
          'border-strong': '#d4c99e',
          btn: '#0b2545',
          'btn-ink': '#ffffff',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
