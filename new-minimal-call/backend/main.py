import os, asyncio, json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import httpx
try:
  from retell import Retell as RetellSDK
except Exception:
  RetellSDK = None

API_KEY = "key_a33923dece07f7dfae3e20c6149f"  # Hard coded per user request (NOT for production!)
BASE_URL = "https://api.retellai.com/v2"

app = FastAPI(title="Retell Minimal Call Demo (HTTPX)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)

class WebCallResponse(BaseModel):
  call_id: str
  access_token: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/agents")
async def list_agents():
  # Prefer SDK if available
  if RetellSDK:
    try:
      loop = asyncio.get_running_loop()
      client = RetellSDK(api_key=API_KEY)
      resp = await loop.run_in_executor(None, client.agent.list)
      if hasattr(resp, 'data'):
        return resp.data
      return resp
    except Exception as e:
      # fall back to raw HTTP
      pass
  try:
    async with httpx.AsyncClient(timeout=30.0) as client:
      r = await client.get(f"{BASE_URL}/agent", headers={"Authorization": f"Bearer {API_KEY}"})
      if r.status_code == 404:
        # maybe plural
        r = await client.get(f"{BASE_URL}/agents", headers={"Authorization": f"Bearer {API_KEY}"})
      r.raise_for_status()
      data = r.json()
      if isinstance(data, dict) and 'data' in data:
        return data['data']
      return data
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"agents error: {e}")

@app.post("/web-call", response_model=WebCallResponse)
async def create_web_call(payload: dict | None = None):
  agent_id = None
  if payload and isinstance(payload, dict):
    agent_id = payload.get("agent_id")
  if RetellSDK:
    try:
      loop = asyncio.get_running_loop()
      client = RetellSDK(api_key=API_KEY)
      def _create():
        if agent_id:
          return client.call.create_web_call(agent_id=agent_id, metadata={})
        # Without agent, cannot create web call via SDK
        raise ValueError("agent_id required for web call")
      resp = await loop.run_in_executor(None, _create)
      return {"call_id": getattr(resp, 'call_id', None), "access_token": getattr(resp, 'access_token', None)}
    except Exception:
      pass
  # Raw HTTP fallback
  try:
    async with httpx.AsyncClient(timeout=30.0) as client:
      body = {"call_type": "web_call"}
      if agent_id:
        body["agent_id"] = agent_id
      errors = []
      for ep in ("create-web-call",):
        url = f"{BASE_URL}/{ep}"
        try:
          r = await client.post(url,
                       headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
                       json=body)
          if r.status_code == 404:
            errors.append(f"{url} -> 404")
            continue
          r.raise_for_status()
          data = r.json()
          return {"call_id": data.get("call_id"), "access_token": data.get("access_token")}
        except httpx.HTTPStatusError as he:
          errors.append(f"{url} {he.response.status_code}: {he.response.text[:120]}")
        except Exception as ie:
          errors.append(f"{url} error {ie}")
      raise HTTPException(status_code=500, detail="; ".join(errors))
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"create call error: {e}")

INDEX_HTML = """<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <title>Retell Ultra Minimal Web Call</title>
  <meta name=viewport content=\"width=device-width,initial-scale=1\" />
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 16px; background:#0d1117; color:#e6edf3; }
    h1 { font-size: 1.3rem; }
    button { cursor:pointer; margin:4px 0; padding:10px 14px; font-size:14px; border-radius:6px; border:1px solid #30363d; background:#238636; color:#fff; }
    button:disabled { background:#30363d; cursor:not-allowed; }
    #agents button { display:block; width:100%; text-align:left; background:#1f6feb; }
    pre { background:#161b22; padding:8px; max-height:220px; overflow:auto; font-size:12px; }
    .row { margin-bottom:12px; }
    .badge { display:inline-block; background:#1f6feb; padding:2px 6px; border-radius:4px; font-size:11px; }
    .status { font-weight:bold; }
  </style>
  <script src=\"https://unpkg.com/retell-client-js-sdk@latest/dist/retell-client-js-sdk.umd.js\"></script>
</head>
<body>
  <h1>Retell Minimal Voice Call</h1>
  <div class=row>
    <button id=loadAgentsBtn>Load Agents</button>
    <div id=agents></div>
  </div>
  <div class=row>
    <button id=startBtn disabled>Start Call</button>
    <button id=stopBtn disabled>Stop Call</button>
    <span class=status id=status>idle</span>
  </div>
  <div class=row>
    <strong>Selected Agent:</strong> <span id=selectedAgent class=badge>None</span>
  </div>
  <div class=row>
    <strong>Events:</strong>
    <pre id=log></pre>
  </div>
  <script>
    const logEl = document.getElementById('log');
    function log(msg){ const t = new Date().toISOString().split('T')[1].replace('Z',''); logEl.textContent += `[${t}] ${msg}\n`; logEl.scrollTop = logEl.scrollHeight; }
    function setStatus(s){ document.getElementById('status').textContent = s; }

    const client = new window.RetellWebClient();
    let currentCall = null;
    let selectedAgentId = null;

    client.on('call_started', () => { log('call_started'); setStatus('in-call'); });
    client.on('agent_start_talking', () => log('agent_start_talking'));
    client.on('agent_stop_talking', () => log('agent_stop_talking'));
    client.on('user_start_talking', () => log('user_start_talking'));
    client.on('user_stop_talking', () => log('user_stop_talking'));
    client.on('audio', (e) => {}); // audio frames already played internally
    client.on('update', (u) => log('update: '+ JSON.stringify(u)));
    client.on('call_ended', () => { log('call_ended'); setStatus('ended'); enableStart(); });
    client.on('error', (err) => { log('ERROR: '+ err.message); setStatus('error'); enableStart(); });

    const loadAgentsBtn = document.getElementById('loadAgentsBtn');
    loadAgentsBtn.onclick = async () => {
      try {
        log('Fetching agents...');
        const res = await fetch('/agents');
        if(!res.ok) throw new Error(await res.text());
        const agents = await res.json();
        const container = document.getElementById('agents');
        container.innerHTML = '';
        if(!agents || agents.length === 0){ container.textContent = 'No agents'; return; }
        agents.forEach(a => {
          const b = document.createElement('button');
          b.textContent = `${a.agent_id} - ${a.name || ''}`;
          b.onclick = () => { selectedAgentId = a.agent_id; document.getElementById('selectedAgent').textContent = selectedAgentId; enableStart(); log('Selected agent '+ selectedAgentId); };
          container.appendChild(b);
        });
        log('Agents loaded');
      } catch(e){ log('Failed to load agents: '+ e.message); }
    };

    function enableStart(){ document.getElementById('startBtn').disabled = !selectedAgentId || currentCall; }
    function enableStop(){ document.getElementById('stopBtn').disabled = !currentCall; }

  document.getElementById('startBtn').onclick = async () => {
      if(!selectedAgentId) return;
      try {
        setStatus('creating-call');
        log('Creating web call for agent '+ selectedAgentId);
    const res = await fetch('/web-call', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({agent_id: selectedAgentId}) });
        if(!res.ok) throw new Error(await res.text());
        const { call_id, access_token } = await res.json();
        log('Received call_id '+ call_id);
        setStatus('connecting');
        await client.startCall({ callId: call_id, accessToken: access_token });
        currentCall = call_id;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
      } catch(e){ log('Start failed: '+ e.message); setStatus('error'); enableStart(); }
    };

    document.getElementById('stopBtn').onclick = async () => {
      try {
        await client.stopCall();
        log('Stop requested');
      } catch(e){ log('Stop failed: '+ e.message); }
      currentCall = null;
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;
    };
  </script>
</body>
</html>"""

@app.get("/", response_class=HTMLResponse)
async def root():
    return HTMLResponse(content=INDEX_HTML)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 7000)))
