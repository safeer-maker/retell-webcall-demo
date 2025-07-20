# 🎙️ Retell Web Call Demo

A complete demonstration application showcasing how to integrate **Retell AI** voice agents into web applications. This project provides both backend API services and a modern React frontend for making voice calls directly in the browser.

## 🌟 Features

- **🤖 AI Voice Agents**: Integration with Retell AI for intelligent voice conversations
- **🌐 Web-based Calls**: Make voice calls directly in the browser without downloads
- **⚡ Real-time Communication**: Instant voice interaction with AI agents
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔧 Production Ready**: Docker containerization and comprehensive configuration
- **📚 Complete Documentation**: Detailed setup and usage instructions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  React Frontend │◄──►│ FastAPI Backend │◄──►│   Retell API    │
│                 │    │                 │    │                 │
│  - Agent List   │    │  - Agent Mgmt   │    │  - Voice Models │
│  - Call UI      │    │  - Call Creation│    │  - Call Handling│
│  - Call Widget  │    │  - API Proxy    │    │  - AI Processing│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      Port 3000              Port 8000           External Service
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (Recommended)
- Or **Node.js 18+** and **Python 3.11+** for local development
- **Retell API Account** - [Sign up here](https://retell.ai)

### 1. Clone the Repository

```bash
git clone https://github.com/safeer-maker/retell-webcall-demo.git
cd retell-webcall-demo
```

### 2. Configure Environment

```bash
# Copy the environment template
cp backend/.env.example backend/.env

# Edit the .env file and add your Retell API key
nano backend/.env
```

Add your Retell API key:
```env
RETELL_API_KEY=your_retell_api_key_here
```

### 3. Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📖 **API Documentation**: http://localhost:8000/docs

## 🛠️ Development Setup

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Retell API key

# Run development server
python main.py
```

Backend will be available at http://localhost:8000

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at http://localhost:3000

## 📁 Project Structure

```
retell-webcall-demo/
├── 📁 backend/                 # FastAPI backend service
│   ├── 🐍 main.py             # Main FastAPI application
│   ├── 📋 requirements.txt    # Python dependencies
│   ├── 🐳 Dockerfile          # Backend container config
│   ├── 🔧 .env.example        # Environment template
│   └── 📖 README.md           # Backend documentation
├── 📁 frontend/                # React frontend application
│   ├── 📁 src/
│   │   ├── ⚛️ App.js          # Main React component
│   │   ├── 🎨 App.css         # Application styles
│   │   ├── 🚀 index.js        # React entry point
│   │   └── 📊 reportWebVitals.js
│   ├── 📁 public/
│   │   └── 🌐 index.html      # HTML template
│   ├── 📦 package.json        # Dependencies & scripts
│   ├── 🐳 Dockerfile          # Frontend container config
│   ├── 🔧 nginx.conf          # Production server config
│   └── 📖 README.md           # Frontend documentation
├── 🐳 docker-compose.yml      # Multi-service orchestration
├── 🚫 .gitignore              # Git ignore rules
└── 📖 README.md               # This file
```

## 🔌 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information and available endpoints |
| `GET` | `/health` | Health check and configuration status |
| `GET` | `/agents` | List all available Retell agents |
| `POST` | `/web-call` | Create a new web call with an agent |

### Example API Usage

```bash
# Check API health
curl http://localhost:8000/health

# List agents
curl http://localhost:8000/agents

# Create web call
curl -X POST http://localhost:8000/web-call \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "your_agent_id"}'
```

## 🎯 Usage Guide

### 1. **Agent Selection**
   - The frontend displays all available agents from your Retell account
   - Each agent shows its ID, name, voice type, and language
   - Click on an agent card to select it

### 2. **Making a Call**
   - Click "Start Web Call" with your selected agent
   - Allow microphone access when prompted by your browser
   - The call interface will load with the Retell voice widget

### 3. **During the Call**
   - Speak clearly into your microphone
   - The AI agent will respond with voice
   - View call information and controls in the interface
   - Click "End Call" when finished

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
RETELL_API_KEY=your_retell_api_key_here    # Required: Your Retell API key
PORT=8000                                   # Optional: Server port (default: 8000)
ENVIRONMENT=development                     # Optional: Environment setting
```

#### Frontend (build-time)
```env
REACT_APP_API_URL=http://localhost:8000     # Optional: Backend API URL
```

### Docker Configuration

The `docker-compose.yml` file configures:
- **Networking**: Isolated network for service communication
- **Health Checks**: Automated service health monitoring
- **Dependencies**: Frontend waits for backend to be healthy
- **Volumes**: Environment file mounting
- **Restart Policies**: Automatic restart on failure

## 🚢 Production Deployment

### Docker Deployment (Recommended)

1. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

3. **Configure Reverse Proxy** (Optional)
   ```nginx
   # Example Nginx configuration
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
       }
       
       location /api/ {
           proxy_pass http://localhost:8000/;
       }
   }
   ```

### Manual Deployment

1. **Backend Production Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   # Use gunicorn for production
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

2. **Frontend Production Build**
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve with nginx, Apache, or CDN
   ```

## 🔒 Security Considerations

- **API Keys**: Store in environment variables, never in code
- **CORS**: Configure specific origins for production
- **HTTPS**: Required for microphone access in production browsers
- **Container Security**: Non-root users in Docker containers
- **Input Validation**: All API inputs validated with Pydantic
- **Error Handling**: No sensitive information in error messages

## 🐛 Troubleshooting

### Common Issues

#### 🔴 "API Unavailable" Error
- **Cause**: Backend service not running or unreachable
- **Solution**: 
  ```bash
  # Check backend health
  curl http://localhost:8000/health
  
  # Check Docker services
  docker-compose ps
  
  # View backend logs
  docker-compose logs backend
  ```

#### 🟡 "API Key Not Configured"
- **Cause**: Missing or invalid `RETELL_API_KEY`
- **Solution**: 
  ```bash
  # Verify environment file
  cat backend/.env
  
  # Restart services after env changes
  docker-compose restart
  ```

#### 🔴 "No Agents Found"
- **Cause**: No agents in Retell account or API permission issues
- **Solution**: 
  - Verify agents exist in your [Retell Dashboard](https://beta.retell.ai/)
  - Check API key permissions
  - Review backend logs for detailed errors

#### 🎤 Microphone Not Working
- **Cause**: Browser permissions or HTTPS requirement
- **Solution**: 
  - Ensure HTTPS in production
  - Check browser microphone permissions
  - Try in a different browser

### Debug Commands

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Check service health
docker-compose ps

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up --build --force-recreate
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch** (`git checkout -b feature/amazing-feature`)
3. **Commit Changes** (`git commit -m 'Add amazing feature'`)
4. **Push to Branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test on multiple browsers and devices
- Ensure Docker builds work correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[Retell AI Documentation](https://docs.retell.ai/)** - Official API documentation
- **[Retell Dashboard](https://beta.retell.ai/)** - Manage your agents and settings
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)** - Backend framework docs
- **[React Documentation](https://reactjs.org/docs/)** - Frontend framework docs

## 🆘 Support

- **Application Issues**: Create an issue in this repository
- **Retell API Issues**: Contact [Retell Support](https://retell.ai/contact)
- **General Questions**: Check the documentation or create a discussion

---

**Made with ❤️ for the developer community**