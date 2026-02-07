import type { SDLCWorkflow } from '../types'

export const SIMPLE_SHOP_WORKFLOW: SDLCWorkflow = {
  id: 'simple-shop',
  name: 'Simple Shop',
  description: 'Full SDLC workflow for building a simple e-commerce shop — 20 steps across 10 roles',
  requiredRoles: ['po', 'analyst', 'ux', 'architect', 'dev', 'qa', 'devops', 'pm', 'sm', 'orchestrator'],
  steps: [
    // Phase 1: Planning
    {
      from: 'po',
      to: 'analyst',
      action: 'kickoffs project with',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Simple Shop Kickoff',
        markdown: `## 🚀 Project: Simple Shop\n\n**Goal**: Build a fast e-commerce site for gamers.\n\n### Core Requirements\n- Dark mode default\n- Instant checkout\n- Twitch integration\n\n> "Speed is everything."`,
      },
    },
    {
      from: 'analyst',
      to: 'ux',
      action: 'delivers user journeys to',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Gamer User Journey',
        markdown: `## 🎮 User Journey Map\n\n1. **Land**: Hero banner with latest game drop.\n2. **Shop**: Grid layout, auto-play trailers on hover.\n3. **Buy**: One-click purchase via Steam/Discord login.\n\n### Personas\n- **Pro**: Buys hardware.\n- **Casual**: Buys merch.`,
      },
    },

    // Phase 2: Design
    {
      from: 'ux',
      to: 'architect',
      action: 'hands off designs to',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'UI/UX Specifications',
        markdown: `## 🎨 Design System: "Neon Nights"\n\n- **Colors**: #000000 (Bg), #00FF00 (Accent)\n- **Font**: Orbitron / Rajdhani\n- **Assets**: Glitch effect SVGs.\n\n**Wireframes attached.**`,
      },
    },
    {
      from: 'architect',
      to: 'dev',
      action: 'defines tech stack for',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Architecture Decision Record',
        markdown: `## 🏗️ Stack Decision: ADR-001\n\n- **Frontend**: Vite + React + Tailwind\n- **Backend**: Node.js + NestJS\n- **DB**: MongoDB (Item catalog)\n- **Cache**: Redis (Cart session)\n\n> Approved for high concurrency.`,
      },
    },

    // Phase 3: Setup & Dev
    {
      from: 'dev',
      to: 'dev',
      action: 'initializes repo with',
      eventType: 'WORKING',
      topic: {
        title: 'Repository Setup',
        markdown: `## 💻 Git Init\n\n\`\`\`bash\ngit init simple-shop\nnpm create vite@latest client\nnest new server\n\`\`\`\n\n**Branches**:\n- \`main\` (Protected)\n- \`dev\` (Staging)\n- \`feat/*\` (Features)`,
      },
    },
    {
      from: 'po',
      to: 'sm',
      action: 'prioritizes backlog with',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Sprint 1 Backlog',
        markdown: `## 🏃 Sprint 1 Goals\n\n1. **P0**: Homepage Hero Section\n2. **P0**: Product Grid\n3. **P1**: Add to Cart\n4. **P2**: User Login`,
      },
    },
    {
      from: 'sm',
      to: 'dev',
      action: 'assigns tasks to',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'JIRA Assignments',
        markdown: `## 📋 Task Board\n\n- **DEV-101**: Setup Layout (Assigned: Alex)\n- **DEV-102**: Build API /products (Assigned: Sarah)\n- **DEV-103**: Cart State Redux (Assigned: Mike)`,
      },
    },
    {
      from: 'dev',
      to: 'dev',
      action: 'scaffolds frontend with',
      eventType: 'WORKING',
      topic: {
        title: 'Vite Setup',
        markdown: `## ⚡ Vite Config\n\nConfigured aliases:\n- \`@components\`\n- \`@hooks\`\n\nInstalled dependencies:\n- \`axios\`\n- \`framer-motion\`\n- \`zustand\``,
      },
    },
    {
      from: 'dev',
      to: 'dev',
      action: 'implements API with',
      eventType: 'WORKING',
      topic: {
        title: 'Product API',
        markdown: `## 🔌 GET /api/products\n\nReturns:\n\`\`\`json\n[\n  { "id": 1, "name": "RGB Keyboard", "price": 99 },\n  { "id": 2, "name": "Pro Mouse", "price": 59 }\n]\n\`\`\``,
      },
    },

    // Phase 4: Review & Test
    {
      from: 'dev',
      to: 'ux',
      action: 'demos components to',
      eventType: 'REVIEW_REQUEST',
      topic: {
        title: 'Storybook Review',
        markdown: `## 📚 Component Library\n\n- **Button**: Primary (Neon), Secondary (Outline)\n- **Card**: Hover effects working.\n- **Navbar**: Responsive.\n\n*Feedback: Increase neon glow intensity.*`,
      },
    },
    {
      from: 'dev',
      to: 'qa',
      action: 'deploys to staging for',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Staging Release v0.1',
        markdown: `## 🧪 Ready for QA\n\nURL: \`staging.simple-shop.internal\`\n\n**Test Areas**:\n- Homepage rendering\n- Product filtering\n- Cart persistence`,
      },
    },
    {
      from: 'qa',
      to: 'dev',
      action: 'reports bug to',
      eventType: 'FEEDBACK',
      topic: {
        title: 'Bug: Cart Reset',
        markdown: `## 🐛 Bug Report #404\n\n**Severity**: High\n\n**Issue**: Cart empties on page refresh.\n\n**Steps**:\n1. Add item\n2. Refresh page\n3. Cart is 0.\n\n**Expected**: LocalStorage persistence.`,
      },
    },
    {
      from: 'dev',
      to: 'qa',
      action: 'pushes hotfix to',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Fix: Persist Cart',
        markdown: `## 🔧 Fix Details\n\nAdded \`zustand/persist\` middleware.\n\n\`\`\`javascript\nexport const useCart = create(persist(\n  (set) => ({ ... }),\n  { name: 'cart-storage' }\n))\n\`\`\``,
      },
    },
    {
      from: 'qa',
      to: 'dev',
      action: 'verifies fix with',
      eventType: 'FEEDBACK',
      topic: {
        title: 'Regression Pass',
        markdown: `## ✅ QA Signed Off\n\n- Cart persists: PASS\n- Login flow: PASS\n- Performance: 98/100 Lighthouse.\n\n**Ready for Prod.**`,
      },
    },

    // Phase 5: Deployment & Launch
    {
      from: 'devops',
      to: 'dev',
      action: 'configures pipeline for',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'GitHub Actions',
        markdown: `## ⚙️ CI/CD Pipeline\n\n1. **Lint & Test**: On PR merge.\n2. **Build Docker**: Push to ECR.\n3. **Deploy**: Update K8s service.`,
      },
    },
    {
      from: 'devops',
      to: 'architect',
      action: 'provisions infra for',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'AWS Environment',
        markdown: `## ☁️ Infrastructure\n\n- **ECS**: Autoscaling group (min 2, max 10).\n- **CloudFront**: CDN for assets.\n- **MongoDB Atlas**: Cluster M10.`,
      },
    },
    {
      from: 'orchestrator',
      to: 'po',
      action: 'requests signoff from',
      eventType: 'REVIEW_REQUEST',
      topic: {
        title: 'Final Demo',
        markdown: `## 🎥 Pre-flight Check\n\nAll P0 and P1 features complete.\n\n- **Budget**: On track.\n- **Timeline**: On schedule.\n\n*Waiting for Green Light...*`,
      },
    },
    {
      from: 'po',
      to: 'orchestrator',
      action: 'approves launch with',
      eventType: 'FEEDBACK',
      topic: {
        title: 'GO FOR LAUNCH',
        markdown: `## 🚀 Launch Decision\n\n**Status**: GO\n\nLet's release to the gamers! Good luck team.`,
      },
    },
    {
      from: 'devops',
      to: 'orchestrator',
      action: 'executes deployment for',
      eventType: 'WORK_REQUEST',
      topic: {
        title: 'Deployment Logs',
        markdown: `## 📜 Deploy Output\n\n> Building... DONE (14s)\n> Pushing image... DONE\n> Updating Service... DONE\n> Health Check... 200 OK\n\n**Service Live at 10.0.0.42**`,
      },
    },
    {
      from: 'orchestrator',
      to: 'pm',
      action: 'announces launch of',
      eventType: 'MESSAGE_SEND',
      topic: {
        title: 'Simple Shop LIVE',
        markdown: `## 🎉 WE ARE LIVE!\n\nSimple Shop is now available to customers.\n\n**Team Simple Shop wins.**`,
      },
    },
  ],
}
