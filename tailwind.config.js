/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pluxee brand colors from pluxee.fr
        'pluxee': {
          'navy': '#221C46',      // Primary dark blue/navy
          'green': '#00EB5E',     // Bright accent green
          'blue': '#88DDFA',      // Light accent blue  
          'yellow': '#FDEEC1',    // Soft pastel yellow
        },
        // Semantic color mappings
        'primary': '#221C46',     // Pluxee navy
        'secondary': '#00EB5E',   // Pluxee green
        'accent': '#88DDFA',      // Pluxee blue
        'tertiary': '#FDEEC1',    // Pluxee yellow
        // Wallet-specific colors for SnackPack
        'meal': '#00EB5E',        // Green for meal wallet
        'transport': '#88DDFA',   // Blue for transport wallet
        'wellness': '#FDEEC1',    // Yellow for wellness wallet
      },
      // Custom gradients using Pluxee colors
      backgroundImage: {
        'pluxee-gradient': 'linear-gradient(135deg, #221C46 0%, #00EB5E 100%)',
        'snackpack-hero': 'linear-gradient(135deg, #221C46 0%, #88DDFA 50%, #00EB5E 100%)',
      },
      // Custom font weights and spacing
      fontFamily: {
        'pluxee': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

