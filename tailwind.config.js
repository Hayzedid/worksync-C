/** @type {import('tailwindcss').Config} */
export const content = [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {
    colors: {
      ws: {
        primary: '#2563eb',   // Blue (trust, productivity)
        secondary: '#14b8a6', // Teal (collaboration, growth)
        accent: '#facc15',    // Yellow (energy, highlights)
        dark: '#1e293b',      // Deep Navy (contrast)
        light: '#f8fafc',     // Light Gray (background)
      },
    },
  },
};
export const plugins = []; 