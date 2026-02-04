from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("Starting up SDLC Game Dashboard API...")
    await init_db()
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="SDLC Game Dashboard API",
    description="Backend API for visualizing AI Agents in SDLC workflow",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "SDLC Game Dashboard API",
        "version": "0.1.0",
        "docs": "/docs",
    }
