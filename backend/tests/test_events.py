"""Tests for event API endpoint."""

import pytest


@pytest.fixture
async def company_with_agents(client):
    """Create a company with agents for testing events."""
    # Create company
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Event Test Co"}
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

    return company_id


# ============== Story 3.1: Event API Endpoint ==============

@pytest.mark.asyncio
async def test_create_event_returns_200(client, company_with_agents):
    """Test POST /api/events returns HTTP 200."""
    company_id = company_with_agents

    response = await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "THINKING",
            "payload": {"thought": "Analyzing requirements"}
        }
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_create_event_returns_correct_fields(client, company_with_agents):
    """Test event response has required fields."""
    company_id = company_with_agents

    response = await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "WORKING",
            "payload": {"task": "Writing specs"}
        }
    )
    data = response.json()

    assert "event_id" in data
    assert "timestamp" in data
    assert data["status"] == "accepted"


@pytest.mark.asyncio
async def test_create_event_invalid_company_returns_404(client):
    """Test event with invalid company_id returns 404."""
    from uuid import uuid4

    response = await client.post(
        "/api/events",
        json={
            "company_id": str(uuid4()),
            "agent_id": "BA-001",
            "event_type": "THINKING",
            "payload": {}
        }
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_event_invalid_agent_returns_404(client, company_with_agents):
    """Test event with invalid agent_id returns 404."""
    company_id = company_with_agents

    response = await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "NONEXISTENT",
            "event_type": "THINKING",
            "payload": {}
        }
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_event_invalid_type_returns_422(client, company_with_agents):
    """Test event with invalid event_type returns 422."""
    company_id = company_with_agents

    response = await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "INVALID_TYPE",
            "payload": {}
        }
    )
    assert response.status_code == 422


# ============== Story 3.2: Core Event Types Processing ==============

@pytest.mark.asyncio
async def test_thinking_event_updates_agent_status(client, company_with_agents):
    """Test THINKING event updates agent status to 'thinking'."""
    company_id = company_with_agents

    # Send THINKING event
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "THINKING",
            "payload": {"thought": "Analyzing problem"}
        }
    )

    # Check agent state
    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    ba_agent = next(a for a in agents if a["agent_id"] == "BA-001")

    assert ba_agent["status"] == "thinking"


@pytest.mark.asyncio
async def test_working_event_updates_agent_status(client, company_with_agents):
    """Test WORKING event updates agent status to 'working'."""
    company_id = company_with_agents

    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "DEV-001",
            "event_type": "WORKING",
            "payload": {"task": "Writing code"}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    dev_agent = next(a for a in agents if a["agent_id"] == "DEV-001")

    assert dev_agent["status"] == "working"


@pytest.mark.asyncio
async def test_idle_event_clears_status(client, company_with_agents):
    """Test IDLE event sets agent status to 'idle'."""
    company_id = company_with_agents

    # First set to working
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "WORKING",
            "payload": {}
        }
    )

    # Then set to idle
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "event_type": "IDLE",
            "payload": {}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    ba_agent = next(a for a in agents if a["agent_id"] == "BA-001")

    assert ba_agent["status"] == "idle"


@pytest.mark.asyncio
async def test_error_event_updates_status(client, company_with_agents):
    """Test ERROR event updates agent status to 'error'."""
    company_id = company_with_agents

    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "DEV-001",
            "event_type": "ERROR",
            "payload": {"error": "Build failed"}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    dev_agent = next(a for a in agents if a["agent_id"] == "DEV-001")

    assert dev_agent["status"] == "error"


# ============== Story 3.3: Communication Event Types ==============

@pytest.mark.asyncio
async def test_work_request_creates_movement(client, company_with_agents):
    """Test WORK_REQUEST with to_agent creates pending movement."""
    company_id = company_with_agents

    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "to_agent": "DEV-001",
            "event_type": "WORK_REQUEST",
            "payload": {"artifact": "requirements.pdf"}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    movements = state_resp.json()["pending_movements"]

    # Should have at least one movement (walk_to)
    assert len(movements) >= 1

    # Check movement details
    walk_movement = next((m for m in movements if m["purpose"] == "handoff"), None)
    assert walk_movement is not None
    assert walk_movement["agent_id"] == "BA-001"


@pytest.mark.asyncio
async def test_message_send_sets_walking_status(client, company_with_agents):
    """Test MESSAGE_SEND with to_agent sets sender to 'walking'."""
    company_id = company_with_agents

    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "to_agent": "DEV-001",
            "event_type": "MESSAGE_SEND",
            "payload": {"message": "Here are the requirements"}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    ba_agent = next(a for a in agents if a["agent_id"] == "BA-001")

    assert ba_agent["status"] == "walking"


# ============== Story 3.4: Smart Movement Inference ==============

@pytest.mark.asyncio
async def test_movement_has_required_fields(client, company_with_agents):
    """Test pending movements include all required fields."""
    company_id = company_with_agents

    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "to_agent": "DEV-001",
            "event_type": "WORK_REQUEST",
            "payload": {"artifact": "spec.doc"}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    movements = state_resp.json()["pending_movements"]

    if len(movements) > 0:
        movement = movements[0]
        assert "id" in movement
        assert "agent_id" in movement
        assert "from_zone" in movement
        assert "to_zone" in movement
        assert "purpose" in movement
        assert "progress" in movement


# ============== Story 3.10: Custom Event Support ==============

@pytest.mark.asyncio
async def test_custom_event_accepted(client, company_with_agents):
    """Test CUSTOM_EVENT is accepted."""
    company_id = company_with_agents

    response = await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "DEV-001",
            "event_type": "CUSTOM_EVENT",
            "payload": {
                "event_name": "deploy",
                "icon": "🚀"
            }
        }
    )
    assert response.status_code == 200


# ============== Movement Completion Tests ==============

@pytest.mark.asyncio
async def test_complete_movement_endpoint(client, company_with_agents):
    """Test movement completion endpoint."""
    company_id = company_with_agents

    # Create a movement via event
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "to_agent": "DEV-001",
            "event_type": "WORK_REQUEST",
            "payload": {}
        }
    )

    # Get the movement id
    state_resp = await client.get(f"/api/companies/{company_id}/state")
    movements = state_resp.json()["pending_movements"]

    if len(movements) > 0:
        movement_id = movements[0]["id"]

        # Complete the movement
        complete_resp = await client.post(
            f"/api/companies/{company_id}/movements/{movement_id}/complete"
        )
        assert complete_resp.status_code == 200
        assert complete_resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_cleanup_completed_movements(client, company_with_agents):
    """Test cleanup of completed movements."""
    company_id = company_with_agents

    # Create and complete a movement
    await client.post(
        "/api/events",
        json={
            "company_id": company_id,
            "agent_id": "BA-001",
            "to_agent": "DEV-001",
            "event_type": "WORK_REQUEST",
            "payload": {}
        }
    )

    state_resp = await client.get(f"/api/companies/{company_id}/state")
    movements = state_resp.json()["pending_movements"]

    if len(movements) > 0:
        movement_id = movements[0]["id"]
        await client.post(f"/api/companies/{company_id}/movements/{movement_id}/complete")

        # Cleanup
        cleanup_resp = await client.delete(f"/api/companies/{company_id}/movements/cleanup")
        assert cleanup_resp.status_code == 200
        assert cleanup_resp.json()["deleted_count"] >= 1
