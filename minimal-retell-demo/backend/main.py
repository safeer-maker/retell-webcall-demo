import os
import asyncio
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from retell import Retell

RETELL_API_KEY = os.getenv("RETELL_API_KEY", "")
if not RETELL_API_KEY:
    print("[WARN] RETELL_API_KEY not set. Set it before creating calls.")

app = FastAPI(title="Minimal Retell Web Call Demo", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple singleton Retell client
_retell_client: Optional[Retell] = None

def get_client() -> Retell:
    global _retell_client
    if _retell_client is None:
        if not RETELL_API_KEY:
            raise HTTPException(status_code=500, detail="RETELL_API_KEY not configured")
        _retell_client = Retell(api_key=RETELL_API_KEY)
    return _retell_client

class Agent(BaseModel):
    agent_id: str
    agent_name: str

class AgentsResponse(BaseModel):
    agents: List[Agent]
    count: int

class CreateWebCallRequest(BaseModel):
    agent_id: str
    metadata: dict = {}

class WebCallResponse(BaseModel):
    call_id: str
    access_token: str
    sample_rate: int = 24000

@app.get("/health")
async def health():
    return {"status": "ok", "api_key_configured": bool(RETELL_API_KEY)}

@app.get("/agents", response_model=AgentsResponse)
async def list_agents():
    client = get_client()
    loop = asyncio.get_running_loop()
    try:
        resp = await loop.run_in_executor(None, client.agent.list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {e}")

    raw = []
    if hasattr(resp, "data"):
        raw = resp.data
    elif isinstance(resp, list):
        raw = resp

    agents = []
    for a in raw:
        agents.append(Agent(
            agent_id=getattr(a, 'agent_id', getattr(a, 'id', 'unknown')),
            agent_name=getattr(a, 'agent_name', getattr(a, 'name', 'Unnamed'))
        ))

    return AgentsResponse(agents=agents, count=len(agents))

@app.post("/web-call", response_model=WebCallResponse)
async def create_web_call(req: CreateWebCallRequest):
    client = get_client()
    loop = asyncio.get_running_loop()
    try:
        web_call = await loop.run_in_executor(
            None,
            lambda: client.call.create_web_call(agent_id=req.agent_id, metadata=req.metadata)
        )
    except Exception as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(status_code=404, detail=f"Agent {req.agent_id} not found")
        raise HTTPException(status_code=500, detail=f"Failed to create web call: {msg}")

    return WebCallResponse(
        call_id=web_call.call_id,
        access_token=web_call.access_token,
        sample_rate=getattr(web_call, 'sample_rate', 24000)
    )

@app.get("/")
async def root():
        return {"message": "Minimal Retell demo", "endpoints": ["/agents", "/web-call", "/health", "/call-demo"]}

CALL_DEMO_HTML = """<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\" />
    <title>Retell Web Call Demo</title>
    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
    <style>
        body { font-family: system-ui, Arial, sans-serif; margin: 2rem; max-width: 740px; }
        label { display:block; margin-top:1rem; font-weight:600; }
        input, select, textarea { width:100%; padding:0.5rem; margin-top:0.25rem; }
        button { margin-top:1rem; padding:0.75rem 1.25rem; font-size:1rem; cursor:pointer; }
        #log { background:#111; color:#eee; padding:0.75rem; height:160px; overflow:auto; font-size:0.8rem; }
        .row { display:flex; gap:0.5rem; }
        .row > * { flex:1; }
        .pill { display:inline-block; padding:0.25rem 0.5rem; border-radius:12px; background:#eee; margin:0.25rem 0.25rem 0 0; }
        .status { font-weight:bold; }
    </style>
    <script type=\"module\" defer>
        import { RetellWebClient } from 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/dist/index.m.js';
        const logEl = () => document.getElementById('log');
        function log(msg){ const el = logEl(); el.textContent += `\n${new Date().toISOString()} ${msg}`; el.scrollTop = el.scrollHeight; }
        let client = null;
        let accessToken = null;
        let currentAgent = null;
        async function fetchAgents(){
            const r = await fetch('/agents');
            if(!r.ok){ throw new Error('Failed to load agents'); }
            const data = await r.json();
            const sel = document.getElementById('agent');
            sel.innerHTML = '';
            for(const a of data.agents){
                const opt = document.createElement('option');
                opt.value = a.agent_id; opt.textContent = a.agent_name + ' (' + a.agent_id.slice(0,8) + '…)';
                sel.appendChild(opt);
            }
            if(data.agents.length){ currentAgent = data.agents[0].agent_id; }
            log(`Loaded ${data.agents.length} agents`);
        }
        async function createSession(){
            const agentId = document.getElementById('agent').value;
            if(!agentId){ return alert('Select agent first'); }
            const metadataTxt = document.getElementById('metadata').value;
            let metadata = {};
            if(metadataTxt.trim()){
                try { metadata = JSON.parse(metadataTxt); } catch(e){ return alert('Metadata JSON invalid: '+e.message); }
            }
            log('Creating web call session...');
            const r = await fetch('/web-call', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ agent_id: agentId, metadata }) });
            if(!r.ok){ log('Failed to create session: ' + await r.text()); return; }
            const data = await r.json();
            accessToken = data.access_token;
            document.getElementById('callId').textContent = data.call_id;
            document.getElementById('token').textContent = accessToken.slice(0,32)+'…';
            log('Session created. Call ID: '+data.call_id);
        }
        async function startCall(){
            if(!accessToken){ return alert('Create session first'); }
            if(client){ log('Call already in progress'); return; }
            client = new RetellWebClient();
            bindEvents();
            try {
                log('Requesting microphone...');
                await navigator.mediaDevices.getUserMedia({ audio:true });
                log('Starting call via SDK...');
                await client.startCall({ accessToken, sampleRate: 24000 });
                document.getElementById('callState').textContent = 'connected';
            } catch(e){ log('Error starting call: '+e.message); client=null; }
        }
        async function endCall(){
            if(!client){ return; }
            try { await client.stopCall(); } catch(_){}
            client = null; document.getElementById('callState').textContent = 'ended';
            log('Call ended');
        }
        function bindEvents(){
            if(!client) return;
            client.on('call_started', e => { log('Event: call_started'); document.getElementById('callState').textContent = 'connected'; });
            client.on('call_ended', e => { log('Event: call_ended'); endCall(); });
            client.on('agent_start_talking', () => log('Agent speaking')); 
            client.on('agent_stop_talking', () => log('Agent stopped')); 
            client.on('user_start_talking', () => log('User speaking')); 
            client.on('user_stop_talking', () => log('User stopped')); 
            client.on('update', e => log('Update event')); 
            client.on('error', e => log('SDK error '+JSON.stringify(e))); 
        }
        window.addEventListener('load', fetchAgents);
        window.demo = { createSession, startCall, endCall };
    </script>
</head>
<body>
    <h1>Retell Web Voice Call (Direct Demo)</h1>
    <p>This page lets you: 1) Fetch agents 2) Create a session 3) Start a live audio call to the agent using <code>retell-client-js-sdk</code>.</p>
    <label>Agent
        <select id="agent"></select>
    </label>
    <label>Metadata JSON (optional)
        <textarea id="metadata" rows="3">{"source":"call-demo"}</textarea>
    </label>
    <div class="row">
        <button onclick="demo.createSession()">1. Create Session</button>
        <button onclick="demo.startCall()">2. Start Call</button>
        <button onclick="demo.endCall()">End Call</button>
    </div>
    <p>Status: <span id="callState" class="status">idle</span></p>
    <p>Call ID: <span id="callId"></span><br/>Token (truncated): <span id="token"></span></p>
    <h3>Log</h3>
    <pre id="log"></pre>
    <p style="font-size:0.8rem;color:#555">Ensure microphone permission is granted. For best results use Chrome (localhost allows http). In production use HTTPS.</p>
</body>
</html>"""

@app.get("/call-demo", response_class=HTMLResponse)
async def call_demo_page():
        return HTMLResponse(content=CALL_DEMO_HTML, status_code=200)

# --- Ultra simple page (fallback) -------------------------------------------------
# Purpose: minimal code path using UMD build (fewer ESM/CORS pitfalls) and a single
# button that: 1) creates call 2) immediately starts it. Includes verbose logging.

SIMPLE_CALL_HTML = """<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Simple Retell Call</title>
<meta name='viewport' content='width=device-width,initial-scale=1'/>
<style>body{font-family:Arial,sans-serif;max-width:640px;margin:1.5rem auto;padding:0 1rem;}button{padding:.75rem 1.2rem;font-size:1rem}#log{white-space:pre-wrap;background:#111;color:#0f0;padding:.75rem;height:220px;overflow:auto;font-size:.75rem;border-radius:6px;margin-top:1rem;}#status{font-weight:bold}</style>
</head><body>
<h1>Simple Retell Web Voice Call</h1>
<p>Status: <span id='status'>idle</span></p>
<label>Agent ID <input id='agent' placeholder='agent_xxx' style='width:100%'/></label>
<label>Metadata JSON (optional)<textarea id='metadata' rows='2' style='width:100%'>{"source":"simple-call"}</textarea></label>
<div style='margin-top:1rem;display:flex;gap:.5rem;flex-wrap:wrap;'>
    <button id='btnCreateAndStart'>Create + Start Call</button>
    <button id='btnEnd'>End Call</button>
    <button id='btnGetAgents'>Load Agents</button>
</div>
<p>Agents (click to fill): <span id='agentsList' style='display:block;margin-top:.3rem;'></span></p>
<div id='creds'></div>
<div id='log' aria-label='log'></div>
<script src='https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/dist/index.umd.js'></script>
<script>(function(){
const logEl=document.getElementById('log');const statusEl=document.getElementById('status');
function log(m){const t=new Date().toISOString()+" "+m;logEl.textContent+="\n"+t;logEl.scrollTop=logEl.scrollHeight;console.log('[retell-demo]',m);} 
let client=null;let accessToken=null;let callId=null;
async function getAgents(){try{log('Fetching agents...');const r=await fetch('/agents');if(!r.ok) throw new Error(await r.text());const data=await r.json();const wrap=document.getElementById('agentsList');wrap.innerHTML='';data.agents.forEach(a=>{const b=document.createElement('button');b.textContent=a.agent_name; b.style.margin='0 .25rem .25rem 0'; b.onclick=()=>{document.getElementById('agent').value=a.agent_id;};wrap.appendChild(b);}); if(!data.agents.length) log('No agents returned'); else log('Loaded '+data.agents.length+' agents');}catch(e){log('Agents error: '+e.message);} }
async function createAndStart(){const agent=document.getElementById('agent').value.trim(); if(!agent){alert('Enter agent id or load & click one agent first'); return;} let md={}; const mdTxt=document.getElementById('metadata').value.trim(); if(mdTxt){ try{md=JSON.parse(mdTxt);}catch(e){alert('Metadata JSON invalid: '+e.message); return;} }
 try{statusEl.textContent='creating'; log('Creating web call...'); const r=await fetch('/web-call',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({agent_id:agent, metadata:md})}); if(!r.ok) throw new Error(await r.text()); const data=await r.json(); accessToken=data.access_token; callId=data.call_id; document.getElementById('creds').innerHTML='<b>Call ID:</b> '+callId+'<br/><b>Token (truncated):</b> '+accessToken.slice(0,30)+'…'; log('Call session created call_id='+callId); await startCall(); }catch(e){statusEl.textContent='error'; log('Create failed: '+e.message);} }
async function startCall(){ if(!accessToken){log('No access token'); return;} if(client){log('Already have a client'); return;} try{ statusEl.textContent='requesting-mic'; await navigator.mediaDevices.getUserMedia({audio:true}); client=new window.RetellWebClient(); bindEvents(); statusEl.textContent='starting'; log('Starting call with SDK...'); await client.startCall({ accessToken }); statusEl.textContent='connected'; log('Call started'); }catch(e){log('Start failed: '+e.message); statusEl.textContent='error'; client=null;} }
function bindEvents(){ if(!client) return; client.on('call_started', e=>{log('Event: call_started'); statusEl.textContent='connected';}); client.on('call_ended', e=>{log('Event: call_ended'); endCall();}); client.on('agent_start_talking', ()=>log('Event: agent_start_talking')); client.on('agent_stop_talking', ()=>log('Event: agent_stop_talking')); client.on('user_start_talking', ()=>log('Event: user_start_talking')); client.on('user_stop_talking', ()=>log('Event: user_stop_talking')); client.on('update', e=>log('Event: update')); client.on('error', e=>{log('Event: error '+JSON.stringify(e));}); }
async function endCall(){ if(!client) return; try { await client.stopCall(); } catch(e){ log('Stop error: '+e.message);} client=null; statusEl.textContent='ended'; log('Call ended'); }
document.getElementById('btnCreateAndStart').onclick=createAndStart; document.getElementById('btnEnd').onclick=endCall; document.getElementById('btnGetAgents').onclick=getAgents; getAgents();})();</script>
</body></html>"""

@app.get("/simple-call", response_class=HTMLResponse)
async def simple_call_page():
        return HTMLResponse(content=SIMPLE_CALL_HTML, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
