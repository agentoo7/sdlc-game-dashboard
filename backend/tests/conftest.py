"""Pytest configuration and fixtures."""

import pytest
import pytest_asyncio
from typing import AsyncGenerator

from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, text

from app.main import app
from app.config import settings
from app.database import get_session

# Import all models to ensure they're registered with SQLModel
from app.models.company import Company
from app.models.agent import Agent
from app.models.event import Event
from app.models.movement import Movement
from app.models.role_config import RoleConfig


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create test database engine for each test function."""
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        future=True,
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(test_engine) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client with clean database."""
    # Truncate all tables before test using actual table names
    async with test_engine.begin() as conn:
        await conn.execute(
            text("TRUNCATE TABLE events, movements, agents, role_configs, companies RESTART IDENTITY CASCADE")
        )

    # Create session factory for this test
    TestAsyncSession = sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        """Override session for tests."""
        async with TestAsyncSession() as session:
            yield session

    # Override the dependency
    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    # Cleanup after test
    async with test_engine.begin() as conn:
        await conn.execute(
            text("TRUNCATE TABLE events, movements, agents, role_configs, companies RESTART IDENTITY CASCADE")
        )

    # Clear dependency override
    app.dependency_overrides.clear()
