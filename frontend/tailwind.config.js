/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Role-based colors
        'role-customer': '#9CA3AF',
        'role-ba': '#3B82F6',
        'role-pm': '#8B5CF6',
        'role-architect': '#F97316',
        'role-developer': '#22C55E',
        'role-qa': '#EF4444',
        // UI colors
        'bg-dark': '#1E293B',
        'bg-darker': '#0F172A',
        'surface': '#334155',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
