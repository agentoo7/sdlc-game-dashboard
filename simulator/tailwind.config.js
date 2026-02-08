/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dashboard color palette (existing)
        'dashboard-bg': '#1F2937',
        'dashboard-surface': '#374151',
        'dashboard-text': '#F9FAFB',
        'dashboard-muted': '#9CA3AF',
        // SDLC Simulator palette (from code.html)
        'sdlc-bg': '#101622',
        'sdlc-primary': '#135bec',
        'sdlc-surface': '#0f172a',
        'sdlc-border': '#1e293b',
        // Dashboard role colors (original)
        'role-customer': '#9CA3AF',
        'role-ba': '#3B82F6',
        'role-pm': '#8B5CF6',
        'role-architect': '#F97316',
        'role-developer': '#22C55E',
        'role-qa': '#EF4444',
        // SDLC role colors (from ref app)
        'role-analyst': '#4ECDC4',
        'role-po': '#FFE66D',
        'role-ux': '#DDA0DD',
        'role-sm': '#F7DC6F',
        'role-dev': '#74B9FF',
        'role-devops': '#FD79A8',
        'role-orchestrator': '#00CEC9',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
