import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

/* Minimal Retell Web Call backend in plain JavaScript (Express)
   Exposes:
   GET  /health          -> { status, api_key_configured }
   GET  /agents          -> list agents [{agent_id, agent_name}]
   POST /web-call        -> create web call session { call_id, access_token, sample_rate }
   GET  /                -> static index.html served from ../public

   Requirements:
   - Set RETELL_API_KEY in env (.env file or shell export)
*/

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(new URL('../public', import.meta.url).pathname));

function requireKey(res) {
  if (!RETELL_API_KEY) {
    res.status(500).json({ error: 'RETELL_API_KEY not configured' });
    return false;
  }
  return true;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', api_key_configured: Boolean(RETELL_API_KEY) });
});

app.get('/agents', async (req, res) => {
  if (!requireKey(res)) return;
  try {
    const r = await fetch('https://api.retellai.com/agents', {
      headers: { Authorization: `Bearer ${RETELL_API_KEY}` }
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: 'Failed to list agents', detail: txt });
    }
    const data = await r.json();
    // Try to normalize shape (SDK returns {data: [...]})
    const raw = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    const agents = raw.map(a => ({
      agent_id: a.agent_id || a.id || 'unknown',
      agent_name: a.agent_name || a.name || 'Unnamed'
    }));
    res.json({ agents, count: agents.length });
  } catch (e) {
    res.status(500).json({ error: 'Exception listing agents', detail: e.message });
  }
});

app.post('/web-call', async (req, res) => {
  if (!requireKey(res)) return;
  const { agent_id, metadata = {} } = req.body || {};
  if (!agent_id) return res.status(400).json({ error: 'agent_id required' });
  try {
    const r = await fetch('https://api.retellai.com/calls/web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent_id, metadata })
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: 'Failed to create web call', detail: txt });
    }
    const data = await r.json();
    res.json({
      call_id: data.call_id,
      access_token: data.access_token,
      sample_rate: data.sample_rate || 24000
    });
  } catch (e) {
    res.status(500).json({ error: 'Exception creating web call', detail: e.message });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url).pathname);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[retell-minimal] Server running on http://localhost:${PORT}`);
  if (!RETELL_API_KEY) {
    console.warn('[retell-minimal] WARNING: RETELL_API_KEY not set. Set it to list agents and create calls.');
  }
});
