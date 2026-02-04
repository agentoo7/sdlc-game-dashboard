from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database (async for app, sync for migrations)
    database_url: str = "postgresql+asyncpg://dashboard:dashboard@db:5432/sdlc_dashboard"

    @property
    def database_url_sync(self) -> str:
        """Synchronous database URL for Alembic migrations."""
        return self.database_url.replace("+asyncpg", "+psycopg2")

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
