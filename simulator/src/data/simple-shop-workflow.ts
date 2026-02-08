import type { SDLCWorkflow } from '../types'

export const SIMPLE_SHOP_WORKFLOW: SDLCWorkflow = {
  id: 'sdlc-workflow',
  name: 'SDLC Workflow',
  description: 'Full SDLC workflow with rich multi-topic interactions across 10 roles',
  requiredRoles: ['analyst', 'pm', 'po', 'architect', 'ux', 'sm', 'dev', 'qa', 'devops', 'orchestrator'],
  steps: [
    {
      from: 'analyst', to: 'pm',
      action: 'chia sẻ kết quả nghiên cứu với',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'User Persona Analysis',
          markdown: `## 📊 User Persona Analysis

### Target Users
- **Primary**: Enterprise managers (35-50 tuổi)
- **Secondary**: Team leads (28-40 tuổi)

### Key Insights
1. **Pain points**: Khó theo dõi tiến độ team
2. **Needs**: Dashboard trực quan, real-time updates
3. **Behavior**: Sử dụng mobile 60% thời gian

### Recommendations
\`\`\`
- Ưu tiên mobile-first design
- Tích hợp notification system
- Simplify navigation flow
\`\`\`

> "Users prefer visual data over text-heavy reports"`
        },
        {
          title: 'Competitor Analysis',
          markdown: `## 🔍 Competitor Analysis

### Top Competitors
| Feature | Us | Competitor A | Competitor B |
|---------|-----|-------------|--------------|
| Price | $$$ | $$ | $$$$ |
| UX | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Features | 85% | 70% | 95% |

### Market Gap
- **AI-powered insights** - chưa ai làm tốt
- **Vietnamese localization** - cơ hội lớn

### Action Items
- [ ] Focus on AI features
- [ ] Improve onboarding
- [ ] Add Vietnamese support`
        }
      ]
    },
    {
      from: 'pm', to: 'po',
      action: 'trình bày PRD cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Feature Roadmap Q2',
          markdown: `## 🗺️ Feature Roadmap Q2 2025

### Sprint 1-2: Foundation
- **User Authentication v2**
  - OAuth 2.0 integration
  - SSO support
  - 2FA implementation

### Sprint 3-4: Core Features
- Dashboard redesign
- Real-time notifications
- Mobile app beta

### Dependencies
\`\`\`mermaid
graph LR
    A[Auth v2] --> B[Dashboard]
    B --> C[Notifications]
    C --> D[Mobile App]
\`\`\`

### Risks
⚠️ **High**: Third-party API changes
⚠️ **Medium**: Resource availability`
        },
        {
          title: 'MVP Requirements',
          markdown: `## 📦 MVP Requirements

### Must Have (P0)
- [x] User login/logout
- [x] Basic dashboard
- [ ] Data export (CSV)
- [ ] Email notifications

### Should Have (P1)
- [ ] Advanced filtering
- [ ] Team management
- [ ] API access

### Nice to Have (P2)
- [ ] Dark mode
- [ ] Custom themes
- [ ] Integrations

### Success Metrics
| Metric | Target | Current |
|--------|--------|---------|
| DAU | 1000 | 450 |
| Retention | 40% | 35% |
| NPS | 50 | 42 |`
        }
      ]
    },
    {
      from: 'dev', to: 'qa',
      action: 'bàn giao code để test cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Login Module',
          markdown: `## 🔐 Login Module - Test Handoff

### Changes
- New OAuth flow implementation
- Session management updates
- Remember me feature

### Test Cases Needed
1. **Happy path**: Normal login flow
2. **Edge cases**:
   - Invalid credentials
   - Expired tokens
   - Network timeout

### API Endpoints
\`\`\`javascript
POST /api/auth/login
POST /api/auth/refresh
DELETE /api/auth/logout
\`\`\`

### Known Issues
⚠️ Token refresh có delay 2-3s

### Environment
- Branch: \`feature/auth-v2\`
- Staging: https://staging.app.com`
        },
        {
          title: 'Payment Integration',
          markdown: `## 💳 Payment Integration

### Supported Methods
- Credit Card (Visa, Master)
- Bank Transfer
- E-wallets (MoMo, ZaloPay)

### Test Scenarios
| Scenario | Expected | Priority |
|----------|----------|----------|
| Success payment | Order confirmed | P0 |
| Card declined | Error message | P0 |
| Timeout | Retry option | P1 |
| Refund | Money returned | P1 |

### Test Cards
\`\`\`
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3DS: 4000 0027 6000 3184
\`\`\`

### Notes
> Sandbox mode enabled for testing`
        }
      ]
    },
    {
      from: 'qa', to: 'dev',
      action: 'báo cáo bug cho',
      eventType: 'FEEDBACK',
      topics: [
        {
          title: 'Critical Bug #1234',
          markdown: `## 🐛 Bug Report #1234

### Summary
**Login fails với special characters trong password**

### Severity: 🔴 Critical

### Steps to Reproduce
1. Go to login page
2. Enter email: test@example.com
3. Enter password: \`P@ss!word#123\`
4. Click Login

### Expected
- User logged in successfully

### Actual
- Error 500: Internal Server Error

### Environment
- Browser: Chrome 120
- OS: Windows 11
- Build: v2.3.1

### Logs
\`\`\`
Error: Invalid escape sequence
at validatePassword (auth.js:45)
at login (auth.js:78)
\`\`\`

### Suggested Fix
> Escape special chars trước khi validate`
        },
        {
          title: 'UI Regression Report',
          markdown: `## 🎨 UI Regression Report

### Affected Areas
- [ ] Dashboard layout
- [x] Sidebar navigation
- [x] Modal dialogs
- [ ] Form inputs

### Screenshots
| Before | After |
|--------|-------|
| ✅ Aligned | ❌ Misaligned |

### CSS Issues Found
\`\`\`css
/* Problem */
.sidebar { margin-left: -10px; }

/* Fix */
.sidebar { margin-left: 0; }
\`\`\`

### Browser Compatibility
- Chrome ✅
- Firefox ❌ (layout broken)
- Safari ⚠️ (minor issues)

### Priority: 🟡 Medium`
        }
      ]
    },
    {
      from: 'architect', to: 'dev',
      action: 'hướng dẫn kiến trúc cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Microservices Pattern',
          markdown: `## 🏗️ Microservices Architecture

### Service Map
\`\`\`
┌─────────────┐
│   Gateway   │
└──────┬──────┘
       │
┌──────┴──────┐
│             │
▼             ▼
┌─────┐   ┌─────┐
│User │   │Order│
│Svc  │   │Svc  │
└─────┘   └─────┘
\`\`\`

### Communication
- **Sync**: REST API, gRPC
- **Async**: RabbitMQ, Kafka

### Best Practices
1. Single responsibility per service
2. Database per service
3. API versioning
4. Circuit breaker pattern

### Code Example
\`\`\`javascript
// Circuit Breaker
const breaker = new CircuitBreaker(
  callService,
  { timeout: 3000, threshold: 5 }
);
\`\`\`

> Keep services small and focused`
        }
      ]
    },
    {
      from: 'ux', to: 'dev',
      action: 'bàn giao design cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Dashboard Redesign',
          markdown: `## 🎨 Dashboard Redesign Specs

### Design System
- **Primary**: #3498db
- **Secondary**: #2ecc71
- **Font**: Inter, 14px base

### Components
| Component | Size | Spacing |
|-----------|------|---------|
| Card | 320px | 16px |
| Button | 40px | 12px |
| Input | 48px | 8px |

### Responsive Breakpoints
\`\`\`css
/* Mobile */
@media (max-width: 768px)

/* Tablet */
@media (max-width: 1024px)

/* Desktop */
@media (min-width: 1025px)
\`\`\`

### Figma Link
🔗 [View Design](https://figma.com/...)

### Animation
- Transitions: 200ms ease
- Hover states: scale(1.02)

> Follow Material Design guidelines`
        }
      ]
    },
    {
      from: 'devops', to: 'dev',
      action: 'hỗ trợ deploy cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'CI/CD Pipeline Setup',
          markdown: `## ⚙️ CI/CD Pipeline

### Pipeline Stages
1. **Build** → 2. **Test** → 3. **Deploy**

### GitHub Actions Config
\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: ./deploy.sh
\`\`\`

### Environment Variables
| Key | Staging | Prod |
|-----|---------|------|
| API_URL | stg.api | api |
| DEBUG | true | false |

### Rollback Command
\`\`\`bash
kubectl rollout undo deployment/app
\`\`\`

⚠️ **Note**: Always test in staging first`
        }
      ]
    },
    {
      from: 'po', to: 'sm',
      action: 'xác nhận user stories với',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Sprint Backlog',
          markdown: `## Sprint Backlog

- Story 1: Login flow
- Story 2: Dashboard
- Story 3: Reports`
        }
      ]
    },
    {
      from: 'sm', to: 'dev',
      action: 'phân công task cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Task Assignment',
          markdown: `## Tasks

| Task | Assignee | Points |
|------|----------|--------|
| API | Dev 1 | 5 |
| UI | Dev 2 | 3 |`
        }
      ]
    },
    {
      from: 'orchestrator', to: 'pm',
      action: 'điều phối tiến độ với',
      eventType: 'MESSAGE_SEND',
      topics: [
        {
          title: 'Project Status',
          markdown: `## Status

- ✅ Phase 1: Complete
- 🔄 Phase 2: In Progress
- ⏳ Phase 3: Pending`
        }
      ]
    }
  ]
}
