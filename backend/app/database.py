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


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        # Import models to register them
        from app.models import company, agent, event, role_config  # noqa: F401

        await conn.run_sync(SQLModel.metadata.create_all)
        print("Database tables created")


async def get_session() -> AsyncSession:
    """Dependency to get database session."""
    async with async_session() as session:
        yield session
