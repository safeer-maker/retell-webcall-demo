# main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import httpx
import uvicorn

API_KEY = os.environ.get("RETELL_API_KEY", "")  # set this in .env or compose
BASE_URL = "https://api.retellai.com/v2"

app = FastAPI(title="Retell Minimal Web Call")

class WebCallResponse(BaseModel):
    call_id: str | None
    access_token: str | None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/agents")
async def list_agents():
    if not API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not configured")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # The API exposes list-agents or agent (pluralization may vary)
        for ep in ("agent", "agents"):
            r = await client.get(f"{BASE_URL}/{ep}", headers={"Authorization": f"Bearer {API_KEY}"})
            if r.status_code == 404:
                continue
            try:
                r.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=500, detail=f"agents error: {e.response.text[:200]}")
            data = r.json()
            # docs usually wrap data in { data: [...] }
            if isinstance(data, dict) and "data" in data:
                return data["data"]
            return data
    raise HTTPException(status_code=500, detail="agents endpoint not found")

@app.post("/web-call", response_model=WebCallResponse)
async def create_web_call(payload: dict | None = None):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not configured")
    agent_id = None
    if payload and isinstance(payload, dict):
        agent_id = payload.get("agent_id")
    body = {"call_type": "web_call"}
    if agent_id:
        body["agent_id"] = agent_id
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(f"{BASE_URL}/create-web-call",
                              headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
                              json=body)
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"create-web-call error: {e.response.text[:400]}")
        data = r.json()
        return {"call_id": data.get("call_id"), "access_token": data.get("access_token")}

# Minimal HTML frontend (uses browser SDK to join call)
INDEX_HTML = """<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Retell Minimal Web Call</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:16px;background:#0d1117;color:#e6edf3}
    button{padding:8px 12px;margin:6px;border-radius:6px;border:none;cursor:pointer}
    .btn-primary{background:#2563eb;color:white}
    .btn-muted{background:#2d3748;color:white}
    #agents button{display:block;margin:6px 0;padding:8px}
    pre{background:#0b1220;padding:8px;border-radius:6px;max-height:220px;overflow:auto}
  </style>
  <!-- Browser SDK (UMD) -->
  <script src="https://unpkg.com/retell-client-js-sdk@latest/dist/retell-client-js-sdk.umd.js"></script>
</head>
<body>
  <h2>Retell — Minimal Web Call</h2>
  <div>
    <button id="loadAgents" class="btn-primary">Load Agents</button>
    <div id="agents"></div>
  </div>
  <div style="margin-top:12px">
    <button id="start" class="btn-primary" disabled>Start Call</button>
    <button id="stop" class="btn-muted" disabled>Stop Call</button>
    <span id="status" style="margin-left:12px">idle</span>
  </div>
  <h4>Events</h4>
  <pre id="log"></pre>

<script>
const logEl = document.getElementById('log');
function log(m){ logEl.textContent += m + "\\n"; logEl.scrollTop = logEl.scrollHeight; }
const client = new window.RetellWebClient();
let selectedAgent = null;
let inCall = false;

client.on('call_started', ()=>{ log('call_started'); document.getElementById('status').innerText='in-call'; });
client.on('call_ended', ()=>{ log('call_ended'); document.getElementById('status').innerText='ended'; inCall=false; updateButtons(); });
client.on('error', (e)=>{ log('ERROR: '+ (e.message||e)); document.getElementById('status').innerText='error'; inCall=false; updateButtons(); });
client.on('update', (u)=>{ log('update: '+ JSON.stringify(u)); });

document.getElementById('loadAgents').onclick = async () => {
  log('Fetching agents...');
  try {
    const r = await fetch('/agents');
    if(!r.ok) throw new Error(await r.text());
    const arr = await r.json();
    const container = document.getElementById('agents');
    container.innerHTML = '';
    if(!arr || arr.length===0){ container.textContent='No agents found'; return; }
    arr.forEach(a=>{
      const b = document.createElement('button');
      b.textContent = (a.agent_id || a.id) + ' — ' + (a.name||'');
      b.onclick = ()=>{ selectedAgent = a.agent_id || a.id; log('Selected agent '+ selectedAgent); updateButtons(); };
      container.appendChild(b);
    });
    log('Agents loaded');
  } catch (e){ log('Agents load failed: '+ e.message); }
};

async function startCall(){
  if(!selectedAgent) return;
  log('Creating web call...');
  try {
    const res = await fetch('/web-call', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({agent_id:selectedAgent})});
    if(!res.ok) throw new Error(await res.text());
    const {call_id, access_token} = await res.json();
    log('call_id: '+call_id);
    document.getElementById('status').innerText='connecting';
    await client.startCall({ callId: call_id, accessToken: access_token });
    inCall = true;
    updateButtons();
  } catch (e){ log('Start failed: '+ e.message); }
}

document.getElementById('start').onclick = startCall;
document.getElementById('stop').onclick = async ()=>{
  try { await client.stopCall(); log('Stop requested'); } catch(e){ log('Stop error: '+ (e.message||e)); }
  inCall = false; updateButtons();
};

function updateButtons(){
  document.getElementById('start').disabled = !selectedAgent || inCall;
  document.getElementById('stop').disabled = !inCall;
}
</script>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def home():
    return HTMLResponse(content=INDEX_HTML)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 7000)), log_level="info")
