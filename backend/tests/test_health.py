"""Tests for health check endpoint."""

import pytest


@pytest.mark.asyncio
async def test_health_endpoint_returns_200(client):
    """Test health endpoint returns HTTP 200."""
    response = await client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_endpoint_returns_correct_structure(client):
    """Test health endpoint returns correct JSON structure."""
    response = await client.get("/api/health")
    data = response.json()

    assert "status" in data
    assert "version" in data
    assert "database" in data


@pytest.mark.asyncio
async def test_health_endpoint_status_is_healthy(client):
    """Test health endpoint returns healthy status."""
    response = await client.get("/api/health")
    data = response.json()

    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_health_endpoint_version_format(client):
    """Test health endpoint returns valid version format."""
    response = await client.get("/api/health")
    data = response.json()

    # Version should be semver-like format
    version = data["version"]
    assert isinstance(version, str)
    assert len(version.split(".")) >= 2  # At least major.minor


@pytest.mark.asyncio
async def test_health_endpoint_database_status(client):
    """Test health endpoint returns database status."""
    response = await client.get("/api/health")
    data = response.json()

    # Database should be either connected or disconnected
    assert data["database"] in ["connected", "disconnected"]


@pytest.mark.asyncio
async def test_health_endpoint_response_time(client):
    """Test health endpoint responds within 200ms (NFR-P02)."""
    import time

    start = time.time()
    response = await client.get("/api/health")
    elapsed_ms = (time.time() - start) * 1000

    assert response.status_code == 200
    assert elapsed_ms < 200, f"Response time {elapsed_ms:.1f}ms exceeds 200ms limit"
