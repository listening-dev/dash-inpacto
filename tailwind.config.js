/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Social networks
        'facebook': '#1877F2',
        'instagram': '#E4405F',
        'linkedin': '#0077B5',
        'twitter': '#14171A',
        // In.Pacto Core Colors
        'inpacto-red': '#C0392B',
        'inpacto-copper': '#D35400',
        'inpacto-orange': '#E67E22',
        'inpacto-gold': '#F39C12',
        'inpacto-dark': '#2C3E50',
        // Soft variants for backgrounds/cards
        'inpacto-red-light': '#FDEDEC',
        'inpacto-copper-light': '#FBEEE6',
        'inpacto-orange-light': '#FDF2E9',
        'inpacto-gold-light': '#FEF5E7',
        // Neo layout
        'neo-bg': '#F5F0EB',
        'neo-sidebar': '#2C3E50',
        'neo-border': '#E2E8F0',
        // Legacy mappings
        'neo-green': '#FDEDEC',
        'neo-yellow': '#FEF5E7',
        'neo-blue': '#EBF5FB',
        'neo-cyan': '#E8F8F5',
        'neo-pink': '#FDEDEC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'brutal': '0 4px 20px -2px rgba(0,0,0,0.05)',
        'brutal-hover': '0 8px 30px -4px rgba(0,0,0,0.1)',
        'brutal-sm': '0 2px 10px -1px rgba(0,0,0,0.03)',
        'brutal-lg': '0 10px 40px -6px rgba(0,0,0,0.12)',
        'neo': '0 4px 20px -2px rgba(0,0,0,0.05)',
      },
      borderWidth: {
        '3': '1px',
      }
    },
  },
  plugins: [],
}
