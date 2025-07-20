# Retell Web Voice Call Demo

A complete web application for making voice calls using the Retell AI API. This project consists of a Python FastAPI backend and a React frontend that enables web-based voice calling with AI agents.

## Project Structure

```
voice-retell-demo/
├── README.md                  # This file
├── docker-compose.yml         # Docker orchestration
├── .env.example              # Environment variables template
├── backend/                   # FastAPI Python backend
│   ├── README.md             # Backend documentation
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile           # Backend Docker configuration
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   └── routes/              # API routes
│       ├── __init__.py
│       ├── agents.py        # Agent management routes
│       └── calls.py         # Voice call routes
└── frontend/                # React frontend
    ├── README.md           # Frontend documentation
    ├── package.json        # Node.js dependencies
    ├── Dockerfile         # Frontend Docker configuration
    ├── public/            # Static assets
    └── src/               # React source code
        ├── components/    # React components
        ├── services/      # API service calls
        └── App.js         # Main application
```

## Features

- 🎯 **Agent Management**: List and manage your Retell AI agents
- 📞 **Web Voice Calls**: Make voice calls directly from the browser
- 🔊 **Real-time Audio**: WebRTC-based audio streaming
- 🐳 **Docker Support**: Complete containerization with Docker Compose
- 🚀 **Easy Setup**: One-command deployment

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Retell AI API key (get it from [Retell AI Dashboard](https://dashboard.retellai.com/))

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd voice-retell-demo
```

### 2. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Retell API key:

```env
RETELL_API_KEY=your_retell_api_key_here
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### 3. Run with Docker

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 4. Manual Setup (Alternative)

If you prefer to run without Docker, see the individual README files in the `backend/` and `frontend/` directories.

## Usage

1. Open the frontend at http://localhost:3000
2. The app will automatically load your available Retell agents
3. Select an agent from the dropdown
4. Click the phone button to start a voice call
5. Grant microphone permissions when prompted
6. Start speaking with your AI agent!

## Configuration

### Environment Variables

- `RETELL_API_KEY`: Your Retell AI API key (required)
- `BACKEND_URL`: Backend service URL (default: http://localhost:8000)
- `FRONTEND_URL`: Frontend service URL (default: http://localhost:3000)

### Retell AI Setup

1. Sign up at [Retell AI](https://retellai.com/)
2. Create an agent in your dashboard
3. Copy your API key
4. Add the API key to your `.env` file

## API Endpoints

- `GET /agents` - List all available agents
- `POST /create-web-call` - Create a new web call session
- `GET /health` - Health check endpoint

## Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Common Issues

1. **Microphone not working**: Ensure HTTPS is enabled for microphone access in production
2. **CORS errors**: Check that the backend CORS settings include your frontend URL
3. **API key errors**: Verify your Retell AI API key is correct and active

### Debug Mode

Set `DEBUG=true` in your `.env` file to enable detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review the individual component READMEs
- Open an issue on GitHub