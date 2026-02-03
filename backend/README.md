# SDLC Game Dashboard Backend

FastAPI backend for the SDLC Game Dashboard.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/companies` - Create company
- `GET /api/companies` - List companies
- `GET /api/companies/{id}/state` - Get company state
- `GET /api/companies/{id}/logs` - Get activity logs
- `POST /api/events` - Send event

## Development

```bash
# Run with Docker
docker-compose up backend

# Or run locally
pip install -e ".[dev]"
uvicorn app.main:app --reload
```
