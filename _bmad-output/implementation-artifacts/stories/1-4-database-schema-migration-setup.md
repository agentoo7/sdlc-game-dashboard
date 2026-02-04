# Story 1.4: Database Schema Migration Setup

Status: done

## Story

As a **developer**,
I want **Alembic migrations to run automatically on backend startup**,
so that **database schema is always up-to-date without manual intervention**.

## Acceptance Criteria

1. **Given** the backend container starts
   **When** it connects to PostgreSQL
   **Then** Alembic runs pending migrations automatically
   **And** migration status is logged to console
   **And** if migrations fail, backend logs error but continues running (graceful degradation)

## Tasks / Subtasks

- [x] Task 1: Initialize Alembic (AC: #1)
  - [x] 1.1 Create alembic.ini configuration file
  - [x] 1.2 Create alembic/env.py with sync support
  - [x] 1.3 Create alembic/versions/ directory
  - [x] 1.4 Configure SQLModel metadata in env.py

- [x] Task 2: Create initial migration (AC: #1)
  - [x] 2.1 Generate migration for existing models (companies, agents, events, role_configs)
  - [x] 2.2 Verify migration script is correct

- [x] Task 3: Auto-run migrations on startup (AC: #1)
  - [x] 3.1 Add migration runner function to database.py
  - [x] 3.2 Call migrations in app lifespan startup
  - [x] 3.3 Log migration status to console
  - [x] 3.4 Implement graceful degradation on failure (fallback to create_all)

## Dev Notes

### Technical Implementation

**Alembic Configuration:**
- Uses synchronous psycopg2 driver for migrations (async driver not supported by Alembic CLI)
- Async asyncpg driver for application database operations
- Database URL automatically converted: `postgresql+asyncpg://` → `postgresql+psycopg2://`

**Migration Flow:**
1. `init_db()` called during FastAPI lifespan startup
2. `run_migrations()` executes `alembic upgrade head`
3. If migrations fail, falls back to `SQLModel.metadata.create_all()`
4. Application continues regardless of migration success

**Console Output:**
```
Starting up SDLC Game Dashboard API...
Running database migrations...
INFO [alembic.runtime.migration] Running upgrade -> 001, Initial database schema
Database migrations completed successfully
```

### References

- [Source: architecture-2026-02-03.md#5.1-Project-Structure] - Backend structure with alembic
- [Source: architecture-2026-02-03.md#6.1-Entity-Relationship-Diagram] - Database schema

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial async approach failed (coroutine not awaited)
- Fixed by using synchronous psycopg2 driver for Alembic

### Completion Notes List

1. **Alembic initialized** - alembic.ini, env.py, script.py.mako created
2. **Initial migration created** - 001_initial_schema.py with all 4 tables
3. **Auto-run on startup** - Migrations run during FastAPI lifespan
4. **Graceful degradation** - Falls back to create_all on migration failure
5. **Verified working** - alembic_version table shows version 001

### File List

**Created:**
- `backend/alembic.ini` - Alembic configuration
- `backend/alembic/env.py` - Migration environment setup
- `backend/alembic/script.py.mako` - Migration script template
- `backend/alembic/versions/20260204_000000_001_initial_schema.py` - Initial migration

**Modified:**
- `backend/app/config.py` - Added database_url_sync property
- `backend/app/database.py` - Added run_migrations() with fallback
- `backend/pyproject.toml` - Added psycopg2-binary dependency
