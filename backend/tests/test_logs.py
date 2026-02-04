"""Tests for activity logs API endpoint."""

import pytest


@pytest.fixture
async def company_with_events(client):
    """Create a company with agents and events for testing logs."""
    # Create company
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Logs Test Co"}
    )
    company_id = company_resp.json()["company_id"]

    # Create agents
    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "BA-001", "name": "Alice", "role": "ba"}
    )
    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DEV-001", "name": "Bob", "role": "developer"}
    )

    # Create events
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "THINKING",
            "payload": {"thought": "Analyzing requirements"}
        }
    )
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "WORKING",
            "payload": {"task": "Writing specs"}
        }
    )
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "DEV-001",
            "event_type": "WORKING",
            "payload": {"task": "Implementing feature"}
        }
    )
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "DEV-001",
            "event_type": "ERROR",
            "payload": {"error": "Build failed"}
        }
    )

    return company_id


# ============== Story 4.4: Activity Log API ==============

@pytest.mark.asyncio
async def test_get_logs_returns_200(client, company_with_events):
    """Test GET /api/companies/{id}/logs returns HTTP 200."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_logs_returns_correct_structure(client, company_with_events):
    """Test logs response has correct structure."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs")
    data = response.json()

    assert "logs" in data
    assert "total" in data
    assert "has_more" in data
    assert isinstance(data["logs"], list)


@pytest.mark.asyncio
async def test_get_logs_sorted_by_timestamp_descending(client, company_with_events):
    """Test logs are sorted by timestamp descending (newest first)."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs")
    logs = response.json()["logs"]

    if len(logs) >= 2:
        # First log should be newer than second
        assert logs[0]["timestamp"] >= logs[1]["timestamp"]


@pytest.mark.asyncio
async def test_get_logs_includes_required_fields(client, company_with_events):
    """Test each log entry has required fields."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs")
    logs = response.json()["logs"]

    if len(logs) > 0:
        log = logs[0]
        assert "id" in log
        assert "timestamp" in log
        assert "event_type" in log
        assert "payload" in log


@pytest.mark.asyncio
async def test_get_logs_filter_by_agent_id(client, company_with_events):
    """Test filtering logs by agent_id."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs?agent_id=BA-001")
    logs = response.json()["logs"]

    # All logs should be from BA-001
    for log in logs:
        assert log["from_agent"] == "BA-001" or log["to_agent"] == "BA-001"


@pytest.mark.asyncio
async def test_get_logs_filter_by_event_type(client, company_with_events):
    """Test filtering logs by event_type."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs?event_type=WORKING")
    logs = response.json()["logs"]

    # All logs should be WORKING type
    for log in logs:
        assert log["event_type"] == "WORKING"


@pytest.mark.asyncio
async def test_get_logs_filter_combined(client, company_with_events):
    """Test filtering logs by both agent_id and event_type."""
    company_id = company_with_events

    response = await client.get(
        f"/api/companies/{company_id}/logs?agent_id=DEV-001&event_type=ERROR"
    )
    logs = response.json()["logs"]

    for log in logs:
        assert log["event_type"] == "ERROR"
        assert log["from_agent"] == "DEV-001" or log["to_agent"] == "DEV-001"


@pytest.mark.asyncio
async def test_get_logs_pagination_limit(client, company_with_events):
    """Test pagination with limit parameter."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs?limit=2")
    data = response.json()

    assert len(data["logs"]) <= 2


@pytest.mark.asyncio
async def test_get_logs_pagination_offset(client, company_with_events):
    """Test pagination with offset parameter."""
    company_id = company_with_events

    # Get all logs first
    all_response = await client.get(f"/api/companies/{company_id}/logs")
    all_logs = all_response.json()["logs"]

    if len(all_logs) >= 2:
        # Get logs with offset
        offset_response = await client.get(f"/api/companies/{company_id}/logs?offset=1")
        offset_logs = offset_response.json()["logs"]

        # First log with offset should be second log without offset
        assert offset_logs[0]["id"] == all_logs[1]["id"]


@pytest.mark.asyncio
async def test_get_logs_has_more_flag(client, company_with_events):
    """Test has_more flag indicates more results available."""
    company_id = company_with_events

    # Request with very small limit
    response = await client.get(f"/api/companies/{company_id}/logs?limit=1")
    data = response.json()

    # Should have more since we created 4 events
    if data["total"] > 1:
        assert data["has_more"] is True


@pytest.mark.asyncio
async def test_get_logs_empty_company(client):
    """Test logs for company with no events."""
    # Create company without events
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Empty Logs Co"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.get(f"/api/companies/{company_id}/logs")
    data = response.json()

    assert data["logs"] == []
    assert data["total"] == 0
    assert data["has_more"] is False


@pytest.mark.asyncio
async def test_get_logs_includes_inferred_actions(client, company_with_events):
    """Test log entries include inferred_actions."""
    company_id = company_with_events

    response = await client.get(f"/api/companies/{company_id}/logs")
    logs = response.json()["logs"]

    if len(logs) > 0:
        # All logs should have inferred_actions field
        for log in logs:
            assert "inferred_actions" in log
            assert isinstance(log["inferred_actions"], list)
