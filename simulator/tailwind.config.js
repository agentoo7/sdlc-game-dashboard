/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dashboard color palette
        'dashboard-bg': '#1F2937',      // Slate 800
        'dashboard-surface': '#374151', // Slate 700
        'dashboard-text': '#F9FAFB',    // Gray 50
        'dashboard-muted': '#9CA3AF',   // Gray 400
        // Role colors
        'role-customer': '#9CA3AF',
        'role-ba': '#3B82F6',
        'role-pm': '#8B5CF6',
        'role-architect': '#F97316',
        'role-developer': '#22C55E',
        'role-qa': '#EF4444',
      },
    },
  },
  plugins: [],
}
