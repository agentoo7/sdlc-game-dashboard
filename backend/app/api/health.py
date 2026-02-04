from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns system status including database connectivity.
    Always returns HTTP 200 even if database is disconnected.
    """
    db_status = "disconnected"

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": db_status,
    }
