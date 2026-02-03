from fastapi import APIRouter

from app.api import companies, events, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
