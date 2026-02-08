import type { SDLCWorkflow } from '../types'

export const SIMPLE_SHOP_WORKFLOW: SDLCWorkflow = {
  id: 'sdlc-workflow',
  name: 'Simple Shop - BMAD SDLC Workflow',
  description: 'Full BMAD SDLC workflow: Analysis → Planning → Solutioning → Implementation',
  requiredRoles: ['analyst', 'pm', 'ux', 'architect', 'sm', 'dev', 'qa'],
  steps: [
    // ============================================================
    // PHASE 1: ANALYSIS
    // ============================================================
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

    // ============================================================
    // PHASE 2: PLANNING
    // ============================================================
    {
      from: 'pm', to: 'ux',
      action: 'gửi PRD và yêu cầu thiết kế UX từ',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Feature Roadmap & PRD',
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
      from: 'ux', to: 'pm',
      action: 'bàn giao thiết kế UX cho',
      eventType: 'WORK_COMPLETE',
      topics: [
        {
          title: 'Dashboard UX Design',
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
        },
        {
          title: 'User Flow & Wireframes',
          markdown: `## 🧭 User Flow - Simple Shop

### Main Navigation Flow
\`\`\`mermaid
graph TD
    A[Login] --> B[Dashboard]
    B --> C[Product List]
    B --> D[Orders]
    B --> E[Reports]
    C --> F[Product Detail]
    F --> G[Add to Cart]
    G --> H[Checkout]
    H --> I[Payment]
    I --> J[Confirmation]
\`\`\`

### Key UX Decisions
1. **3-click rule**: Mọi action chính trong 3 click
2. **Progressive disclosure**: Chỉ hiện info cần thiết
3. **Consistent feedback**: Mọi action có visual response

### Wireframe Notes
| Screen | Priority | Status |
|--------|----------|--------|
| Login | P0 | ✅ Done |
| Dashboard | P0 | ✅ Done |
| Product List | P0 | ✅ Done |
| Checkout | P0 | 🔄 In Progress |
| Reports | P1 | ⏳ Pending |

> Mobile wireframes hoàn thành 80%, cần review lại tablet layout`
        }
      ]
    },

    // ============================================================
    // PHASE 3: SOLUTIONING
    // ============================================================
    {
      from: 'pm', to: 'architect',
      action: 'yêu cầu thiết kế kiến trúc từ',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Architecture Requirements',
          markdown: `## 📋 Yêu cầu kiến trúc - Simple Shop

### Functional Requirements (từ PRD)
- User authentication (OAuth 2.0, SSO, 2FA)
- Product catalog với search & filter
- Shopping cart & checkout flow
- Payment integration (Stripe, MoMo, ZaloPay)
- Real-time notifications
- Admin dashboard

### Non-Functional Requirements
| Requirement | Target |
|-------------|--------|
| Response time | < 200ms (P95) |
| Availability | 99.9% uptime |
| Concurrent users | 10,000 |
| Data storage | 5 năm retention |

### Technical Constraints
- **Budget**: Cloud hosting < $500/month
- **Team**: 3 developers, 1 QA
- **Timeline**: MVP trong 4 sprints (8 tuần)
- **Stack preference**: React + Node.js

### UX Highlights cần support
- Mobile-first responsive
- Real-time updates (WebSocket)
- Offline capability cho mobile app

> Architect cần đánh giá trade-offs và đề xuất kiến trúc phù hợp`
        }
      ]
    },
    {
      from: 'architect', to: 'pm',
      action: 'trình bày kiến trúc hệ thống cho',
      eventType: 'WORK_COMPLETE',
      topics: [
        {
          title: 'System Architecture',
          markdown: `## 🏗️ Microservices Architecture - Simple Shop

### Service Map
\`\`\`
┌─────────────────┐
│   API Gateway   │
│   (nginx)       │
└────────┬────────┘
         │
┌────────┼────────┐
│        │        │
▼        ▼        ▼
┌─────┐ ┌─────┐ ┌─────┐
│User │ │Order│ │Notif│
│Svc  │ │Svc  │ │Svc  │
└──┬──┘ └──┬──┘ └──┬──┘
   │       │       │
   ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐
│MySQL│ │MySQL│ │Redis│
└─────┘ └─────┘ └─────┘
\`\`\`

### Communication Patterns
- **Sync**: REST API cho client, gRPC cho internal
- **Async**: RabbitMQ cho event-driven (order → notification)

### Key Architecture Decisions
1. **Monorepo** cho MVP - dễ manage với team nhỏ
2. **Database per service** - tách biệt data
3. **API versioning** - /api/v1/ prefix
4. **Circuit breaker** - resilience pattern

### Code Example
\`\`\`javascript
// Circuit Breaker Pattern
const breaker = new CircuitBreaker(
  callService,
  { timeout: 3000, threshold: 5 }
);
\`\`\`

### Deployment
- **Staging**: Docker Compose
- **Production**: Kubernetes (GKE)
- **CI/CD**: GitHub Actions

> Keep services small and focused. Bắt đầu monolith, tách service khi cần.`
        }
      ]
    },
    {
      from: 'pm', to: 'sm',
      action: 'bàn giao epics và user stories cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Sprint Backlog - Epic Breakdown',
          markdown: `## 📋 Sprint Backlog - Simple Shop MVP

### Epic 1: User Authentication (Sprint 1)
| ID | User Story | Points | Priority |
|----|-----------|--------|----------|
| US-001 | As a user, I want to register with email/password | 3 | P0 |
| US-002 | As a user, I want to login with OAuth 2.0 (Google) | 5 | P0 |
| US-003 | As a user, I want to enable 2FA for security | 3 | P1 |
| US-004 | As an admin, I want to manage user roles | 5 | P1 |

### Epic 2: Product Catalog (Sprint 2)
| ID | User Story | Points | Priority |
|----|-----------|--------|----------|
| US-005 | As a user, I want to browse products with pagination | 3 | P0 |
| US-006 | As a user, I want to search products by name/category | 5 | P0 |
| US-007 | As a user, I want to filter products by price/rating | 3 | P1 |
| US-008 | As an admin, I want to CRUD products | 5 | P0 |

### Epic 3: Order & Payment (Sprint 3-4)
| ID | User Story | Points | Priority |
|----|-----------|--------|----------|
| US-009 | As a user, I want to add products to cart | 3 | P0 |
| US-010 | As a user, I want to checkout and pay | 8 | P0 |
| US-011 | As a user, I want to view order history | 3 | P1 |
| US-012 | As an admin, I want to process refunds | 5 | P1 |

### Sprint Velocity Target
- **Team capacity**: 3 devs × 8 points = **24 points/sprint**
- **Sprint duration**: 2 tuần

### Definition of Done
- [ ] Code reviewed & approved
- [ ] Unit tests > 80% coverage
- [ ] Integration tests passed
- [ ] Deployed to staging
- [ ] QA sign-off`
        }
      ]
    },

    // ============================================================
    // PHASE 4: IMPLEMENTATION
    // ============================================================
    {
      from: 'sm', to: 'dev',
      action: 'phân công sprint tasks cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Sprint 1 - Task Assignment',
          markdown: `## 🎯 Sprint 1: User Authentication

### Sprint Goal
> Hoàn thành đăng ký, đăng nhập, và OAuth flow cho Simple Shop

### Task Breakdown
| Task | Story | Assignee | Points | Status |
|------|-------|----------|--------|--------|
| Setup project structure | US-001 | Dev 1 | 1 | 🆕 |
| Implement registration API | US-001 | Dev 1 | 2 | 🆕 |
| Implement login/logout API | US-001 | Dev 2 | 2 | 🆕 |
| OAuth 2.0 Google integration | US-002 | Dev 2 | 3 | 🆕 |
| Session management & JWT | US-002 | Dev 1 | 2 | 🆕 |
| Login/Register UI components | US-001 | Dev 3 | 3 | 🆕 |
| OAuth callback handling UI | US-002 | Dev 3 | 2 | 🆕 |
| Write unit tests | All | Dev 1 | 2 | 🆕 |
| Integration testing | All | QA | 3 | 🆕 |

### Acceptance Criteria - US-001
\`\`\`
GIVEN user on registration page
WHEN fills valid email + password (min 8 chars, 1 uppercase, 1 number)
THEN account created AND confirmation email sent
AND user redirected to login page
\`\`\`

### Acceptance Criteria - US-002
\`\`\`
GIVEN user clicks "Login with Google"
WHEN Google OAuth consent completed
THEN user authenticated AND JWT token issued
AND user redirected to dashboard
\`\`\`

### Daily Standup: 9:00 AM
### Sprint Review: Friday tuần 2`
        }
      ]
    },
    {
      from: 'dev', to: 'qa',
      action: 'bàn giao code để test cho',
      eventType: 'WORK_REQUEST',
      topics: [
        {
          title: 'Login Module - Test Handoff',
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
      from: 'dev', to: 'sm',
      action: 'báo cáo hoàn thành sprint cho',
      eventType: 'WORK_COMPLETE',
      topics: [
        {
          title: 'Sprint 1 Deliverables',
          markdown: `## ✅ Sprint 1 - Kết quả hoàn thành

### Completed Stories
| ID | Story | Points | Status |
|----|-------|--------|--------|
| US-001 | Registration with email/password | 3 | ✅ Done |
| US-002 | Login with OAuth 2.0 | 5 | ✅ Done |
| US-003 | Enable 2FA | 3 | ⚠️ 80% (UI done, SMS pending) |

### Sprint Metrics
- **Planned**: 16 points
- **Completed**: 14 points
- **Velocity**: 87.5%

### Code Quality
\`\`\`
Unit Tests:     45 passed, 2 skipped
Coverage:       83% (target: 80%) ✅
Lint Warnings:  3 (non-blocking)
Build Time:     42s
\`\`\`

### Bugs Fixed During Sprint
- 🔴 #1234: Login special chars → **Fixed**
- 🟡 #1235: Sidebar CSS regression → **Fixed**
- 🟢 #1236: Typo in error message → **Fixed**

### Carry-over to Sprint 2
- US-003: SMS provider integration (2 points remaining)

### Pull Requests
| PR | Title | Reviewer | Status |
|----|-------|----------|--------|
| #42 | feat: OAuth 2.0 login | Dev 2 | ✅ Merged |
| #43 | feat: registration flow | Dev 3 | ✅ Merged |
| #44 | fix: special char bug | Dev 1 | ✅ Merged |

> Overall sprint 1 thành công. Team đã deliver 87.5% planned work.`
        }
      ]
    },
    {
      from: 'sm', to: 'pm',
      action: 'báo cáo retrospective sprint cho',
      eventType: 'FEEDBACK',
      topics: [
        {
          title: 'Sprint 1 Retrospective',
          markdown: `## 🔄 Sprint 1 Retrospective - Simple Shop

### Sprint Summary
- **Duration**: 2 tuần (06/01 - 06/14)
- **Velocity**: 14/16 points (87.5%)
- **Team**: 3 Devs + 1 QA

### ✅ What Went Well
1. **OAuth integration** hoàn thành sớm 2 ngày
2. **Code review process** chặt chẽ, bắt được 2 critical bugs sớm
3. **Daily standup** đúng giờ, hiệu quả (< 15 phút)
4. **Collaboration** giữa Dev và QA rất tốt

### ❌ What Needs Improvement
1. **Estimation**: US-003 (2FA) underestimated → SMS provider phức tạp hơn dự kiến
2. **Documentation**: API docs chưa kịp update khi code thay đổi
3. **Environment**: Staging deploy process mất 30 phút → cần tự động hóa

### 🎯 Action Items for Sprint 2
| Action | Owner | Deadline |
|--------|-------|----------|
| Setup CI/CD auto-deploy staging | Dev 1 | Sprint 2 Day 3 |
| Add API doc generation (Swagger) | Dev 2 | Sprint 2 Day 5 |
| Review estimation process | SM | Sprint 2 Planning |
| Complete US-003 SMS integration | Dev 3 | Sprint 2 Day 4 |

### 📊 Project Progress
\`\`\`mermaid
graph LR
    A[Phase 1: Analysis] -->|✅| B[Phase 2: Planning]
    B -->|✅| C[Phase 3: Solutioning]
    C -->|✅| D[Phase 4: Implementation]
    D -->|🔄 Sprint 1 Done| E[Sprint 2]
    E -->|⏳| F[Sprint 3-4]
\`\`\`

### Overall Status
- ✅ Phase 1: Analysis - Complete
- ✅ Phase 2: Planning - Complete
- ✅ Phase 3: Solutioning - Complete
- 🔄 Phase 4: Implementation - Sprint 1/4 Done (25%)

> Team performance tốt cho sprint đầu tiên. Cần cải thiện estimation và CI/CD cho sprint 2.`
        }
      ]
    }
  ]
}
