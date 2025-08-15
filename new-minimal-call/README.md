# New Minimal Retell Call Demo

Ultra-minimal FastAPI backend that:
- Lists agents: GET /agents
- Creates web call: POST /web-call
- Serves a one-page UI at /

Hard-coded API key (NOT FOR PRODUCTION): `key_a33923dece07f7dfae3e20c6149f`

## Run (Docker)
```
cd new-minimal-call
docker compose up --build
```
Open http://localhost:7000

## Manual (Local Python)
```
pip install -r backend/requirements.txt
python backend/main.py
```

## Usage Steps
1. Click Load Agents.
2. Click an agent to select.
3. Click Start Call (allow microphone permission).
4. Speak; watch events log for talking events.
5. Stop Call to hang up.

## Troubleshooting
- If agents list empty: verify the API key has agents in dashboard.
- If Start Call hangs at connecting: check browser console for WebRTC errors; network may block UDP/DTLS.
- If microphone denied: refresh page and allow permission.
