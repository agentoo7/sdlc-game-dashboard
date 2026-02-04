from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with validation."""

    # Database (async for app, sync for migrations)
    database_url: str = "postgresql+asyncpg://dashboard:dashboard@db:5432/sdlc_dashboard"

    @property
    def database_url_sync(self) -> str:
        """Synchronous database URL for Alembic migrations."""
        return self.database_url.replace("+asyncpg", "+psycopg2")

    # CORS - accepts comma-separated string or list
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins as list."""
        if isinstance(self.cors_origins, list):
            return self.cors_origins
        # Handle comma-separated string
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    # Logging
    log_level: str = "INFO"

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level is valid."""
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid_levels:
            raise ValueError(f"log_level must be one of {valid_levels}")
        return v.upper()

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL format."""
        if not v.startswith("postgresql"):
            raise ValueError("database_url must start with 'postgresql'")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
