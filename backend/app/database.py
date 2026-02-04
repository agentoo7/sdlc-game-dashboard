import os
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=True,  # Log SQL queries (disable in production)
    future=True,
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def run_migrations() -> bool:
    """
    Run Alembic migrations synchronously.

    Returns True if successful, False otherwise.
    Implements graceful degradation - logs errors but doesn't crash.
    """
    try:
        # Get the directory where alembic.ini is located
        backend_dir = Path(__file__).parent.parent
        alembic_ini_path = backend_dir / "alembic.ini"

        if not alembic_ini_path.exists():
            print(f"Migration warning: alembic.ini not found at {alembic_ini_path}")
            return False

        # Create Alembic config
        alembic_cfg = Config(str(alembic_ini_path))

        # Set the script location relative to alembic.ini
        alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))

        # Override the database URL from settings (use sync URL for alembic)
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url_sync)

        # Run migrations
        print("Running database migrations...")
        command.upgrade(alembic_cfg, "head")
        print("Database migrations completed successfully")
        return True

    except Exception as e:
        print(f"Migration error (continuing anyway): {e}")
        print("Note: Tables may be created using SQLModel.metadata.create_all as fallback")
        return False


async def init_db():
    """
    Initialize database.

    First attempts to run Alembic migrations.
    Falls back to create_all if migrations fail (graceful degradation).
    """
    # Import models to register them with SQLModel metadata
    from app.models import Agent, Company, Event, Movement, RoleConfig  # noqa: F401

    # Try to run migrations
    migration_success = run_migrations()

    if not migration_success:
        # Fallback: create tables directly
        print("Fallback: Creating tables using SQLModel.metadata.create_all")
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
            print("Database tables created via fallback")


async def get_session() -> AsyncSession:
    """Dependency to get database session."""
    async with async_session() as session:
        yield session
