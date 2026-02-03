---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - brainstorming-session-2026-02-03.md
  - phaser-2.5d-isometric-research.md
  - project-context.md
date: 2026-02-03
author: Binh Tran
project_name: SDLC Game Dashboard
tagline: "Looks like a game, but it's real AI at work"
---

# Product Brief: SDLC Game Dashboard

## Executive Summary

**SDLC Game Dashboard** là một web-based visualization platform biến quá trình làm việc "vô hình" của AI Agents thành một trải nghiệm trực quan, hấp dẫn như game.

Dashboard phục vụ các cuộc thi/hackathon nơi nhiều team thi đua xây dựng AI Agents tự động hóa quy trình SDLC. Người xem có thể theo dõi real-time hoạt động của các agents trong một "virtual company", tạo sự hào hứng và minh bạch cho cuộc thi.

**Tagline:** *"Looks like a game, but it's real AI at work"*

**Key Value Propositions:**
- 🎮 Game-like experience với chibi characters trong isometric office
- 🏢 Multi-company support với thumbnail grid selector
- 📺 Public viewable - bất kỳ ai cũng có thể xem
- 📝 Activity logging (input/output) để đánh giá kết quả

---

## Core Vision

### Problem Statement

Trong các cuộc thi xây dựng AI Agents cho SDLC automation:
- **Invisible Process**: AI agents làm việc trong "hộp đen" - người xem không thấy được quá trình
- **Boring Monitoring**: Các công cụ monitoring hiện tại (logs, terminals) không engaging
- **Lack of Transparency**: Khó đánh giá và so sánh hoạt động giữa các teams
- **Missing Entertainment**: Thiếu yếu tố "spectator sport" cho competitions

### Problem Impact

- Judges khó đánh giá quá trình, chỉ thấy kết quả cuối
- Spectators mất hứng thú vì không hiểu chuyện gì đang xảy ra
- Teams không có cách showcase impressive AI work của mình
- Competition thiếu yếu tố entertainment và engagement

### Why Existing Solutions Fall Short

| Solution hiện tại | Vấn đề |
|-------------------|--------|
| Terminal logs | Boring, technical, không visual |
| Monitoring dashboards | Khô khan, chỉ số liệu, không engaging |
| Screen recordings | Không real-time, không interactive |
| No visualization | "Hộp đen" hoàn toàn |

### Proposed Solution

**2D Game-Style Dashboard** với:

**Visual Experience:**
- Chibi characters đại diện cho AI agents (BA, PM, Dev, QA, Architect)
- Isometric 2.5D office environment
- Animated workflows: agents di chuyển, handoff artifacts, thể hiện emotions

**Multi-Company Architecture:**
- Thumbnail grid để chọn virtual company muốn xem
- Mỗi company có office riêng với agents riêng
- Switch giữa các companies dễ dàng

**Engagement Features:**
- Real-time visualization của agent activities
- Emotion expressions (thinking 💭, working 📝, success 🎉)
- Interactive: zoom, pan, click agents for details

**Logging & Evaluation:**
- Log input/output của mỗi agent action
- Activity history cho việc đánh giá sau
- Timeline để replay và review

### Key Differentiators

| Differentiator | Giá trị |
|----------------|---------|
| **Game Aesthetic** | Biến monitoring thành entertainment |
| **Chibi Characters** | Memorable, engaging, không boring |
| **Real-time Visualization** | Transparency cho competitions |
| **Multi-company** | Scale cho nhiều teams thi đua |
| **Public Access** | Ai cũng có thể xem, tăng engagement |
| **Activity Logging** | Data cho evaluation và improvement |

---

## Target Users

### Primary Users

#### 1. Spectator - "Người Xem Cuộc Thi"

**Profile:**
- Developers, tech enthusiasts, students tham dự live event
- Quan tâm đến AI/automation trong SDLC
- Muốn xem các teams thi đấu real-time

**Motivations:**
- 🎮 Entertainment - xem AI agents làm việc như xem game
- 📚 Learning - hiểu cách AI automation hoạt động
- 🏆 Excitement - cổ vũ team yêu thích

**Pain Points hiện tại:**
- Không thấy được quá trình, chỉ thấy kết quả cuối
- Monitoring tools boring, không hiểu gì
- Thiếu engagement trong competitions

**Success với Dashboard:**
> "Wow, tôi thấy rõ agent BA đang viết spec, rồi handoff cho Dev! Exciting hơn xem logs nhiều!"

**Key Interactions:**
- Chọn company từ thumbnail grid
- Zoom/pan để theo dõi agents
- Click agent để xem details
- Follow mode để track 1 agent cụ thể

---

#### 2. Judge - "Giám Khảo Cuộc Thi"

**Profile:**
- Technical experts đánh giá các teams
- Cần theo dõi nhiều companies
- Quan tâm đến cả process và results

**Motivations:**
- ⚖️ Fair evaluation - đánh giá công bằng dựa trên process
- 📊 Data-driven - cần evidence cho scoring
- ⏱️ Efficiency - theo dõi nhiều teams hiệu quả

**Pain Points hiện tại:**
- Chỉ thấy output cuối, không thấy process
- Khó so sánh approaches giữa các teams
- Thiếu data để justify decisions

**Success với Dashboard:**
> "Tôi có thể xem lại activity log để hiểu team này approach problem như thế nào. Fair hơn nhiều!"

**Key Interactions:**
- Switch giữa các companies nhanh chóng
- Review activity logs (input/output của agents)
- Timeline để xem lại các events quan trọng
- Click agent details để hiểu workflow

---

### Secondary Users

Không có secondary users đặc biệt. Dashboard được thiết kế primarily cho public viewing tại live events.

---

### User Journey

#### Spectator Journey (Live Event)

```
[Arrive at Event]
    → Thấy màn hình lớn hiển thị dashboard

[Browse Companies]
    → Nhìn thumbnail grid, chọn company muốn xem

[Watch & Engage]
    → Theo dõi agents di chuyển, làm việc
    → "Ồ, Dev đang thinking!" "BA vừa handoff xong!"

[Deep Dive]
    → Click agent để xem chi tiết
    → Double-click để follow 1 agent

[Switch & Compare]
    → Chuyển sang xem company khác
    → So sánh approaches
```

#### Judge Journey (Evaluation)

```
[Start Evaluation]
    → Mở dashboard, chọn company cần đánh giá

[Observe Process]
    → Xem agents làm việc real-time
    → Note các patterns, collaboration

[Review Logs]
    → Xem activity timeline
    → Check input/output của specific agents

[Switch Companies]
    → Chuyển sang team tiếp theo
    → Compare và contrast approaches

[Final Assessment]
    → Dựa trên observations + logs để scoring
```

---

## Success Metrics

### User Success Metrics

#### Spectators - "Excited & Engaged"

| Metric | Indicator | Target |
|--------|-----------|--------|
| **Excitement Level** | Reactions (cheers, gasps, comments) | Observable engagement tại live event |
| **Watch Duration** | Thời gian xem trung bình | > 70% thời gian event |
| **Company Switching** | Số lần switch giữa companies | Active exploration (3+ companies/viewer) |
| **Deep Engagement** | Sử dụng interactive features | > 50% viewers dùng zoom/click/follow |

**Success Statement:**
> "Spectators actively watching, reacting, và discussing AI agents như xem esports match"

---

#### Judges - "Sufficient Data for Fair Evaluation"

| Metric | Indicator | Target |
|--------|-----------|--------|
| **Data Completeness** | Log coverage | 100% agent actions logged |
| **Data Accessibility** | Time to find specific info | < 30 seconds |
| **Evaluation Confidence** | Judge self-reported | "Có đủ data để đánh giá công bằng" |
| **Review Efficiency** | Time per company evaluation | Giảm so với manual review |

**Success Statement:**
> "Judges có thể trace back bất kỳ decision nào của AI agents với full input/output logs"

---

### Technical Success Metrics

#### Performance - "No Lag"

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| **Frame Rate** | 60 FPS | > 30 FPS minimum |
| **Event Latency** | < 500ms từ API → visual | < 2s maximum |
| **Load Time** | < 3s initial load | < 5s maximum |
| **Concurrent Companies** | Support 10+ companies | Minimum 5 |
| **Concurrent Viewers** | Handle 100+ viewers | Minimum 50 |

**Success Statement:**
> "Dashboard chạy mượt mà, real-time, không lag ngay cả khi nhiều activities xảy ra đồng thời"

---

### Event Success Metrics

#### Audience Engagement - "Tăng So Với Trước"

| Metric | Measurement | Success Indicator |
|--------|-------------|-------------------|
| **Attention Retention** | % audience still watching | Higher than previous events without dashboard |
| **Social Buzz** | Social media mentions, photos | Dashboard được share/discuss |
| **Audience Feedback** | Post-event survey | Positive mentions về visualization |
| **Return Intent** | "Muốn xem event tiếp theo?" | Increased interest |

**Success Statement:**
> "Audience engagement visibly higher - người xem tập trung, discuss, và share về dashboard"

---

### Key Performance Indicators (KPIs)

| Category | KPI | How to Measure |
|----------|-----|----------------|
| **Engagement** | Active viewing rate | % viewers interacting vs passive |
| **Technical** | Uptime during event | Target: 99.9% |
| **Data Quality** | Log completeness | % actions captured |
| **User Satisfaction** | Post-event rating | Target: > 4/5 stars |

---

### Business Objectives

*Note: Đây là Tech Contest project, không phải commercial product.*

| Objective | Description |
|-----------|-------------|
| **Demo Success** | Impress judges với technical execution |
| **Showcase Value** | Prove concept của game-style visualization |
| **Reusability** | Architecture có thể reuse cho future events |
| **Learning** | Team gains experience với Phaser.js + FastAPI |

---

## MVP Scope

### Core Features

#### 1. Backend API (FastAPI + PostgreSQL)

**Endpoints:**

| Endpoint | Purpose |
|----------|---------|
| `POST /api/companies` | Register virtual company |
| `POST /api/events` | Receive agent events from Dev App |
| `GET /api/companies` | List companies for thumbnail grid |
| `GET /api/companies/{id}/state` | Get current state of a company |
| `GET /api/companies/{id}/logs` | Get activity logs for evaluation |

**Smart Event Processing:**

Client App (AI Agents) gửi notifications, Server xử lý visualization:

```
CLIENT APP (AI Agents)              SERVER (Dashboard)
No visualization                    ALL visualization

ba_agent.receive(client_001)   →   POST /api/events
                                   { from: "Client-001",
                                     to: "BA-001",
                                     type: "WORK_REQUEST" }

                               ←   { status: "accepted" }

                                   Server decides HOW to render:
                                   • Animate BA-001 receiving
                                   • Show thought bubble
                                   • Update status indicator

                                   Viewers see animation in browser
```

→ Client App chỉ thông báo actions qua API
→ Server quyết định cách visualize
→ Viewers xem dashboard do server render

**Event Types (Business-Driven):**

| Event Type | Visual Interpretation |
|------------|----------------------|
| `WORK_REQUEST` | from_agent đi đến to_agent, giao task, về |
| `WORK_COMPLETE` | from_agent đi đến to_agent, giao result, về |
| `REVIEW_REQUEST` | from_agent đi đến to_agent, request review |
| `FEEDBACK` | from_agent đi đến to_agent, gửi feedback |
| `THINKING` | Agent hiện 💭 bubble |
| `WORKING` | Agent hiện 📝 animation |
| `IDLE` | Agent về trạng thái idle |

#### 2. Frontend Dashboard (Phaser.js + TypeScript)

**Visual Components:**
- Isometric 2.5D office layout với departments (Customer, BA, PM, Architect, Dev, QA)
- Chibi agent sprites với animations (idle, walk, work, think)
- Department zones với role-based colors
- Agent ID labels floating

**Interactivity:**
- Thumbnail grid để chọn company
- Zoom in/out (scroll wheel)
- Pan (drag)
- Click agent để highlight

**Movement System (Server-Driven):**
- Server quyết định khi nào agent di chuyển (dựa trên business events)
- Dashboard tự tính path từ department A → department B
- Smooth tween animation cho walking
- Agent cầm artifact khi handoff
- Auto return về desk sau khi giao việc

#### 3. Data & Logging

**PostgreSQL Schema (SQLModel):**
- `Company` - Virtual companies
- `Agent` - Agents trong mỗi company
- `Event` - Activity logs với input/output payload
- `AgentState` - Current state snapshot

**Logging:**
- Mọi business event được log với timestamp
- Full payload preserved cho evaluation
- Query API cho judges review

---

### Out of Scope for MVP

| Feature | Reason | Future Version |
|---------|--------|----------------|
| WebSocket real-time | REST API response-based đủ (không cần polling) | V2 nếu cần |
| Explicit move commands | Server infers từ business events | N/A |
| Sound effects | Time consuming | V2 |
| Particle effects | Polish feature | V2 |
| Follow mode | Nice-to-have | V1.5 |
| Emotion contagion | Complex animation | V2 |
| Timeline replay | Advanced feature | V2 |
| Detailed agent panel | Polish feature | V1.5 |

---

### MVP Success Criteria

| Criteria | Target |
|----------|--------|
| **Demo-able** | Có thể demo live tại event |
| **Multi-company** | Hỗ trợ ≥5 companies đồng thời |
| **Event Processing** | Events hiển thị trong <2s |
| **Stable** | No crash suốt event duration |
| **Logging** | 100% events được log với payload |
| **Judge-friendly** | Có thể review logs dễ dàng |

---

### Technical Stack (Confirmed)

| Layer | Technology |
|-------|------------|
| **Frontend** | Phaser 3.x + TypeScript + Vite |
| **Backend** | FastAPI + Python 3.11+ |
| **Database** | PostgreSQL 16 |
| **ORM** | SQLModel |
| **Container** | Docker + Colima (macOS) |

---

### Future Vision (Post-MVP)

**V1.5 - Polish:**
- Click agent → detail panel
- Follow mode (double-click)
- Better animations
- Timeline with filter

**V2.0 - Advanced:**
- WebSocket for viewer sync (multiple viewers see same animation)
- Sound effects
- Particle effects (celebrations)
- Emotion contagion
- Timeline replay
- Analytics dashboard

