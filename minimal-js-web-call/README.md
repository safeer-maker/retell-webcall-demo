# Minimal Retell Web Call (Pure JavaScript)

Very small example (no build tooling) to:

1. List your Retell AI agents
2. Create a web call session for a chosen agent
3. Start / end a live voice call in the browser via `retell-client-js-sdk` (loaded from CDN)

## Structure
```
minimal-js-web-call/
  server/
    package.json
    server.js          # Express server exposing /agents, /web-call
  public/
    index.html         # Simple UI using the SDK UMD build
  README.md
```

## Prerequisites
- Node.js 18+
- A Retell AI API key (from https://dashboard.retellai.com/)

## Setup & Run

Create an `.env` file inside `server/` (or export the variable):
```
RETELL_API_KEY=your_retell_api_key_here
```
Install and start:
```
cd server
npm install
npm start
```
Open http://localhost:3000 in your browser.

## Usage
1. Click "Load Agents" – populates the dropdown.
2. Select an agent.
3. (Optional) Adjust metadata JSON.
4. Click "Create Session".
5. Click "Start Call" (allow microphone permission when prompted).
6. Speak with the agent. Use "End Call" to hang up.

## Notes
- This is intentionally minimal: no error modals, no styling frameworks.
- Uses fetch directly instead of SDK on backend to avoid extra dependencies.
- In production, serve via HTTPS for microphone access (HTTP only allowed for localhost in modern browsers).
- If no agents appear, verify your API key and that you have created agents in the Retell dashboard.

## Extending
- Add auth (e.g., JWT) around the endpoints.
- Persist call logs / transcripts.
- Add retry logic or exponential backoff for network errors.

MIT License.
