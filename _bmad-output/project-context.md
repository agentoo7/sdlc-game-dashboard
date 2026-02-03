# Project Context: SDLC Game Dashboard

**Last Updated:** 2026-02-03

---

## Development Environment

### Operating System
- **Platform:** macOS
- **Docker Runtime:** Colima (lightweight Docker alternative for macOS)

### Development Principles
- **Containerized Development:** Always use Docker containers for development and testing
- **No Local Dependencies:** All tooling runs inside containers
- **Reproducible Builds:** Consistent environment across team members

---

## Container Strategy

### Development Containers
```yaml
# Expected docker-compose structure
services:
  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"  # Vite dev server

  backend:
    build: ./backend
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"  # FastAPI server
    environment:
      - PYTHONUNBUFFERED=1
      - DATABASE_URL=postgresql://user:pass@db:5432/sdlc_dashboard
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=sdlc_dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Benefits
- Consistent Node.js/npm versions
- Isolated Phaser.js environment
- Easy onboarding for new developers
- CI/CD compatible

---

## Technical Stack (Planned)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | | |
| Game Engine | Phaser 3.x | Isometric 2.5D support |
| Language | TypeScript | Type safety |
| Build Tool | Vite or Webpack | Fast HMR |
| **Backend** | | |
| Framework | FastAPI (Python) | High performance, async |
| Language | Python 3.11+ | Modern Python |
| API Style | REST + WebSocket | Real-time events |
| ORM | SQLModel | Single model for DB + Pydantic |
| **Database** | | |
| Database | PostgreSQL | Reliable, scalable |
| ORM Pattern | SQLModel | SQLAlchemy + Pydantic combined |
| Validation | Pydantic (via SQLModel) | Same model for API + DB |
| **Infrastructure** | | |
| Container | Docker + Colima | macOS development |
| Package Manager | npm/pnpm + pip/poetry | Frontend + Backend |

---

## SQLModel Approach

### Why SQLModel?

SQLModel = SQLAlchemy + Pydantic in one model. Created by the same author as FastAPI.

```python
# Single model for BOTH database AND API validation
from sqlmodel import SQLModel, Field

class Agent(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    agent_id: str = Field(index=True)  # e.g., "Dev-001"
    role: str                           # e.g., "Developer"
    status: str = "idle"                # idle, thinking, working
    current_task: str | None = None

# Same model used for:
# - Database table definition
# - API request/response validation
# - Auto-generated OpenAPI docs
```

### Benefits
- **DRY**: One model, multiple uses
- **Type Safety**: Full Python typing support
- **Auto Docs**: FastAPI generates OpenAPI from models
- **Async Support**: Works with async SQLAlchemy

---

## Project Constraints

1. **Must run in Docker** - No "works on my machine" issues
2. **macOS primary** - Colima as Docker runtime
3. **Web-based** - Browser deployment target
4. **API-driven** - Dashboard consumes external API events

---

## File Structure (Expected)

```
sdlc-game-dashboard/
├── docker-compose.yml       # Container orchestration
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── game/           # Phaser game code
│   │   ├── components/     # UI components
│   │   └── assets/         # Sprites, tilemaps
│   └── public/
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml      # Python dependencies
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── api/            # API routes
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   └── tests/
└── _bmad-output/            # Planning artifacts
```
