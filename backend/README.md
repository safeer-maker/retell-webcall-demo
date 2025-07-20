# Backend - FastAPI Retell Voice Call Service

This is the Python FastAPI backend service for the Retell Web Voice Call Demo. It provides RESTful APIs for managing Retell AI agents and creating web voice call sessions.

## Features

- List available Retell AI agents
- Create web call sessions
- Handle WebRTC audio streaming
- CORS configuration for frontend integration
- Health check endpoints
- Comprehensive error handling

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Retell Python SDK**: Official SDK for Retell AI integration
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for running the application

## Setup

### Prerequisites

- Python 3.8+
- Retell AI API key

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
```bash
export RETELL_API_KEY="your_retell_api_key_here"
# Or create a .env file in the root directory
```

### Running the Server

#### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
- **GET** `/health` - Check if the service is running

### Agents
- **GET** `/agents` - List all available Retell AI agents

### Web Calls
- **POST** `/create-web-call` - Create a new web call session
  - Request body: `{"agent_id": "your_agent_id"}`
  - Returns: Call details including access token and call ID

## Configuration

The application uses the following environment variables:

- `RETELL_API_KEY`: Your Retell AI API key (required)
- `DEBUG`: Enable debug logging (default: false)

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and environment variables
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
└── routes/             # API route modules
    ├── __init__.py
    ├── agents.py       # Agent management endpoints
    └── calls.py        # Voice call endpoints
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Invalid or missing API key
- **404 Not Found**: Agent or resource not found
- **500 Internal Server Error**: Server-side errors

All errors return structured JSON responses:

```json
{
  "detail": "Error description",
  "error_code": "SPECIFIC_ERROR_CODE"
}
```

## Development

### Adding New Routes

1. Create a new file in the `routes/` directory
2. Define your route functions
3. Import and include the router in `main.py`

Example:
```python
from fastapi import APIRouter

router = APIRouter(prefix="/your-prefix", tags=["your-tag"])

@router.get("/endpoint")
async def your_endpoint():
    return {"message": "Hello World"}
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Style

This project uses:
- **Black** for code formatting
- **isort** for import sorting
- **flake8** for linting

```bash
# Format code
black .
isort .

# Check linting
flake8 .
```

## Docker

### Build the image
```bash
docker build -t retell-backend .
```

### Run the container
```bash
docker run -p 8000:8000 -e RETELL_API_KEY=your_key retell-backend
```

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure all dependencies are installed
2. **API key errors**: Verify your Retell AI API key is correct
3. **CORS issues**: Check CORS configuration in main.py
4. **Port conflicts**: Ensure port 8000 is available

### Debug Mode

Set `DEBUG=true` to enable detailed logging:

```bash
export DEBUG=true
uvicorn main:app --reload --log-level debug
```

## Production Deployment

### Environment Setup
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper logging
- Configure SSL/TLS certificates
- Set up monitoring and health checks

### Recommended Production Command
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```
