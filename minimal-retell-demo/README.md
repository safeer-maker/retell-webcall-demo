# Minimal Retell Web Call Demo

A stripped-down example showing how to:

1. List Retell agents
2. Create a web call session (retrieve access token + call id)
3. Use a lightweight Gradio UI to trigger the flow

## Structure
```
minimal-retell-demo/
  backend/
    main.py              # FastAPI backend exposing /agents and /web-call
    requirements.txt
    Dockerfile
  frontend/
    app.py               # Gradio interface to list agents & create call
    requirements.txt
    Dockerfile
  docker-compose.yml     # Compose to run both services
```

## Prerequisites
- Docker & Docker Compose
- Valid Retell API key (export RETELL_API_KEY)

## Quick Start
```bash
cd minimal-retell-demo
export RETELL_API_KEY=sk_live_xxx   # or place in an .env file
docker compose up -d --build
```

Backend: http://localhost:8800

Gradio UI: http://localhost:7860

## Using the Demo
1. Open the Gradio UI.
2. Click Refresh Agents (loads your available agents via backend /agents).
3. Select an agent, optionally modify metadata JSON.
4. Click "Create Web Call Session".
5. You'll receive Call ID + Access Token and a JS snippet. Use these credentials in a browser client that imports `retell-client-js-sdk` and calls:
```javascript
import { RetellWebClient } from 'retell-client-js-sdk';
const c = new RetellWebClient();
await c.startCall({ accessToken: '<ACCESS_TOKEN_FROM_UI>', sampleRate: 24000 });
```
Your voice conversation should start (ensure microphone permission granted).

## Environment Variables
- RETELL_API_KEY (backend)  
- BACKEND_URL (frontend; auto set in docker-compose)

## Local Dev Without Docker
Backend:
```bash
cd backend
export RETELL_API_KEY=sk_live_xxx
pip install -r requirements.txt
uvicorn main:app --reload
```
Frontend (Gradio):
```bash
cd frontend
pip install -r requirements.txt
BACKEND_URL=http://localhost:8000 python app.py
```

## Notes
- This demo intentionally omits persistence, auth, and advanced error handling.
- For production, restrict CORS origins and add logging/observability.

## Troubleshooting
- No agents: Verify your Retell dashboard has at least one agent.
- 500 errors: Check backend logs (`docker logs <backend-container>`).
- Call creation fails: Confirm API key and agent id.
- Browser call issues: Ensure the `retell-client-js-sdk` is installed and microphone permissions allowed.
