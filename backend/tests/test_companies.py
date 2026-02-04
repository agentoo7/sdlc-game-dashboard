"""Tests for company and agent API endpoints."""

import pytest
from uuid import uuid4


# ============== Story 2.1: Company Registration API ==============

@pytest.mark.asyncio
async def test_create_company_returns_201(client):
    """Test POST /api/companies returns HTTP 201."""
    response = await client.post(
        "/api/companies",
        json={"name": "Test Company", "description": "Test description"}
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_company_returns_correct_fields(client):
    """Test POST /api/companies returns required fields."""
    response = await client.post(
        "/api/companies",
        json={"name": "Test Company 2"}
    )
    data = response.json()

    assert "company_id" in data
    assert "name" in data
    assert "created_at" in data
    assert data["name"] == "Test Company 2"


@pytest.mark.asyncio
async def test_create_company_without_name_returns_422(client):
    """Test POST /api/companies without name returns HTTP 422."""
    response = await client.post(
        "/api/companies",
        json={"description": "Missing name"}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_company_with_agents(client):
    """Test POST /api/companies with agents array."""
    response = await client.post(
        "/api/companies",
        json={
            "name": "Team with Agents",
            "agents": [
                {"agent_id": "DEV-001", "name": "Alice", "role": "developer"}
            ]
        }
    )
    assert response.status_code == 201


# ============== Story 2.2: List Companies API ==============

@pytest.mark.asyncio
async def test_list_companies_returns_200(client):
    """Test GET /api/companies returns HTTP 200."""
    response = await client.get("/api/companies")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_companies_returns_array(client):
    """Test GET /api/companies returns companies array."""
    response = await client.get("/api/companies")
    data = response.json()

    assert "companies" in data
    assert isinstance(data["companies"], list)


@pytest.mark.asyncio
async def test_list_companies_includes_required_fields(client):
    """Test each company has required fields."""
    # Create a company first
    await client.post("/api/companies", json={"name": "Field Test Co"})

    response = await client.get("/api/companies")
    data = response.json()

    if len(data["companies"]) > 0:
        company = data["companies"][0]
        assert "company_id" in company
        assert "name" in company
        assert "agent_count" in company
        assert "status" in company


@pytest.mark.asyncio
async def test_list_companies_pagination(client):
    """Test GET /api/companies with pagination."""
    response = await client.get("/api/companies?limit=10&offset=0")
    assert response.status_code == 200


# ============== Story 2.3: Create Agent API ==============

@pytest.mark.asyncio
async def test_create_agent_returns_201(client):
    """Test POST /api/companies/{id}/agents returns HTTP 201."""
    # Create company first
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Agent Test Co"}
    )
    company_id = company_resp.json()["company_id"]

    # Create agent
    response = await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "BA-001", "name": "Bob", "role": "ba"}
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_agent_returns_role_config(client):
    """Test agent response includes role_config."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Role Config Test"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DEV-002", "name": "Carol", "role": "developer"}
    )
    data = response.json()

    assert "role_config" in data
    assert "display_name" in data["role_config"]
    assert "color" in data["role_config"]


@pytest.mark.asyncio
async def test_create_duplicate_agent_returns_409(client):
    """Test duplicate agent_id returns HTTP 409."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Duplicate Test"}
    )
    company_id = company_resp.json()["company_id"]

    # Create first agent
    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DUP-001", "name": "First", "role": "developer"}
    )

    # Try to create duplicate
    response = await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DUP-001", "name": "Second", "role": "developer"}
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_create_agent_invalid_company_returns_404(client):
    """Test creating agent for non-existent company returns 404."""
    fake_id = str(uuid4())
    response = await client.post(
        f"/api/companies/{fake_id}/agents",
        json={"agent_id": "TEST-001", "name": "Test", "role": "developer"}
    )
    assert response.status_code == 404


# ============== Story 2.4: Dynamic Role System ==============

@pytest.mark.asyncio
async def test_custom_role_creates_config(client):
    """Test custom role auto-creates role_config."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Custom Role Test"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "SEC-001", "name": "Security", "role": "security_engineer"}
    )
    data = response.json()

    assert data["role_config"]["display_name"] == "Security Engineer"
    assert data["role_config"]["is_default"] is False


# ============== Story 2.5: Get Company State API ==============

@pytest.mark.asyncio
async def test_get_company_state_returns_200(client):
    """Test GET /api/companies/{id}/state returns HTTP 200."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "State Test Co"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.get(f"/api/companies/{company_id}/state")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_company_state_includes_agents(client):
    """Test state includes agents array."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "State Agents Test"}
    )
    company_id = company_resp.json()["company_id"]

    # Create an agent
    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "ST-001", "name": "State Agent", "role": "developer"}
    )

    response = await client.get(f"/api/companies/{company_id}/state")
    data = response.json()

    assert "agents" in data
    assert len(data["agents"]) == 1
    assert data["agents"][0]["agent_id"] == "ST-001"


@pytest.mark.asyncio
async def test_get_company_state_includes_last_updated(client):
    """Test state includes last_updated timestamp."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Timestamp Test"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.get(f"/api/companies/{company_id}/state")
    data = response.json()

    assert "last_updated" in data


@pytest.mark.asyncio
async def test_get_company_state_includes_pending_movements(client):
    """Test state includes pending_movements array."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Movements Test"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.get(f"/api/companies/{company_id}/state")
    data = response.json()

    assert "pending_movements" in data
    assert isinstance(data["pending_movements"], list)


# ============== Story 2.6: Remove Agent API ==============

@pytest.mark.asyncio
async def test_delete_agent_returns_200(client):
    """Test DELETE /api/companies/{id}/agents/{agent_id} returns HTTP 200."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Delete Test Co"}
    )
    company_id = company_resp.json()["company_id"]

    # Create agent
    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DEL-001", "name": "To Delete", "role": "developer"}
    )

    # Delete agent
    response = await client.delete(f"/api/companies/{company_id}/agents/DEL-001")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_agent_returns_correct_response(client):
    """Test delete response has correct format."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "Delete Response Test"}
    )
    company_id = company_resp.json()["company_id"]

    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "DEL-002", "name": "Delete Me", "role": "developer"}
    )

    response = await client.delete(f"/api/companies/{company_id}/agents/DEL-002")
    data = response.json()

    assert data["agent_id"] == "DEL-002"
    assert data["status"] == "removed"


@pytest.mark.asyncio
async def test_delete_nonexistent_agent_returns_404(client):
    """Test deleting non-existent agent returns 404."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "404 Test"}
    )
    company_id = company_resp.json()["company_id"]

    response = await client.delete(f"/api/companies/{company_id}/agents/NONEXISTENT")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_deleted_agent_not_in_state(client):
    """Test deleted agent no longer appears in company state."""
    company_resp = await client.post(
        "/api/companies",
        json={"name": "State After Delete"}
    )
    company_id = company_resp.json()["company_id"]

    await client.post(
        f"/api/companies/{company_id}/agents",
        json={"agent_id": "GONE-001", "name": "Gone", "role": "developer"}
    )

    # Delete the agent
    await client.delete(f"/api/companies/{company_id}/agents/GONE-001")

    # Check state
    state_resp = await client.get(f"/api/companies/{company_id}/state")
    agents = state_resp.json()["agents"]
    agent_ids = [a["agent_id"] for a in agents]

    assert "GONE-001" not in agent_ids
