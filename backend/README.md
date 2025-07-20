# Retell Web Call Demo - Backend

This is the FastAPI backend service for the Retell Web Call Demo application. It provides RESTful API endpoints to interact with the Retell API for managing agents and creating web calls.

## Features

- **Agent Management**: List all available agents from your Retell account
- **Web Call Creation**: Create new web calls with specified agents
- **Health Monitoring**: Health check endpoint for service monitoring
- **CORS Support**: Configured for cross-origin requests
- **Error Handling**: Comprehensive error handling and logging
- **Docker Support**: Containerized deployment ready

## Prerequisites

- Python 3.11 or higher
- Retell API account and API key
- pip package manager

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and add your Retell API key:

```env
RETELL_API_KEY=your_actual_retell_api_key_here
PORT=8000
ENVIRONMENT=development
```

### 2. Local Development

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the development server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 3. API Documentation

Once running, visit these URLs for interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### GET `/`
Root endpoint providing API information and available endpoints.

**Response:**
```json
{
  "message": "Retell Web Call Demo API",
  "version": "1.0.0",
  "endpoints": {
    "/agents": "GET - List all available agents",
    "/web-call": "POST - Create a new web call",
    "/health": "GET - Health check endpoint"
  }
}
```

### GET `/health`
Health check endpoint for monitoring service status.

**Response:**
```json
{
  "status": "healthy",
  "api_key_status": "configured"
}
```

### GET `/agents`
List all available agents from your Retell account.

**Response:**
```json
[
  {
    "agent_id": "agent_123",
    "agent_name": "Customer Support Agent",
    "voice_id": "voice_456",
    "language": "en-US"
  }
]
```

### POST `/web-call`
Create a new web call with the specified agent.

**Request Body:**
```json
{
  "agent_id": "agent_123"
}
```

**Response:**
```json
{
  "call_id": "call_789",
  "access_token": "access_token_abc"
}
```

## Docker Deployment

### Build the Docker Image

```bash
docker build -t retell-backend .
```

### Run with Docker

```bash
docker run -d \
  --name retell-backend \
  -p 8000:8000 \
  -e RETELL_API_KEY=your_api_key_here \
  retell-backend
```

### Environment Variables for Docker

- `RETELL_API_KEY`: Your Retell API key (required)
- `PORT`: Port to run the server (default: 8000)
- `ENVIRONMENT`: Environment setting (default: development)

## Development

### Code Structure

```
backend/
├── main.py              # Main FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
├── .env.example        # Environment template
└── README.md           # This file
```

### Adding New Endpoints

1. Define Pydantic models for request/response
2. Add the endpoint function with proper type hints
3. Include error handling and logging
4. Update this README with documentation

### Error Handling

The API includes comprehensive error handling:

- **500 Internal Server Error**: For Retell API errors or missing API key
- **422 Validation Error**: For invalid request data
- Global exception handler for unexpected errors

### Logging

The application uses Python's built-in logging module:

- **INFO**: Successful operations and key events
- **ERROR**: Error conditions and exceptions
- **WARNING**: Missing configuration warnings

## Security Considerations

- API key is loaded from environment variables
- Non-root user in Docker container
- CORS is configured (update for production)
- Input validation using Pydantic models

## Troubleshooting

### Common Issues

1. **"Retell API key not configured"**
   - Ensure `RETELL_API_KEY` is set in your environment
   - Check that the API key is valid

2. **"Failed to fetch agents"**
   - Verify your Retell API key has proper permissions
   - Check your internet connection

3. **CORS errors**
   - Update the CORS middleware configuration for your frontend domain

### Health Check

Use the health endpoint to verify service status:

```bash
curl http://localhost:8000/health
```

## Production Deployment

For production deployment:

1. Set `ENVIRONMENT=production`
2. Configure specific CORS origins
3. Use a production WSGI server
4. Set up proper logging and monitoring
5. Use secrets management for API keys
6. Configure reverse proxy (nginx/Apache)

## Support

For issues related to the Retell API, consult the [Retell Documentation](https://docs.retell.ai/).

For application-specific issues, check the logs and ensure all environment variables are properly configured.