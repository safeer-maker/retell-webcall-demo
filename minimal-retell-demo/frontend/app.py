import os
import json
import asyncio
import gradio as gr
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def fetch_agents():
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{BACKEND_URL}/agents")
        r.raise_for_status()
        data = r.json()
        options = [(a['agent_name'], a['agent_id']) for a in data.get('agents', [])]
        return options

async def start_call(agent_id, metadata_json):
    if not agent_id:
        return "Select an agent first", None, None

    try:
        metadata = json.loads(metadata_json) if metadata_json.strip() else {}
    except json.JSONDecodeError as e:
        return f"Invalid metadata JSON: {e}", None, None

    async with httpx.AsyncClient(timeout=20) as client:
        payload = {"agent_id": agent_id, "metadata": metadata}
        r = await client.post(f"{BACKEND_URL}/web-call", json=payload)
        if r.status_code != 200:
            return f"Error: {r.text}", None, None
        data = r.json()

    # Provide details for using retell-client-js-sdk in browser
    curl_example = (
        f"Call ID: {data['call_id']}\nAccess Token: {data['access_token']}\n"
        f"Sample Rate: {data['sample_rate']}\n\nUse these creds in your web client JS: \n"
        "const client = new RetellWebClient();\nclient.startCall({ accessToken: '" + data['access_token'] + "', sampleRate: " + str(data['sample_rate']) + " });"
    )
    return "Call session created.", data['call_id'], curl_example

async def refresh_agents_interface():
    options = await fetch_agents()
    return gr.update(choices=[o[0] for o in options], value=(options[0][0] if options else None)), json.dumps(options, indent=2)

with gr.Blocks(title="Minimal Retell Web Call UI") as demo:
    gr.Markdown("# Minimal Retell Web Call Demo\nFetch agents, create web call session, then use credentials in JS.")

    with gr.Row():
        refresh_btn = gr.Button("🔄 Refresh Agents", variant="secondary")
        status = gr.Markdown("Loading agents...")

    agents_dropdown = gr.Dropdown(label="Agents (Name)", choices=[], value=None)
    hidden_agent_map = gr.Textbox(label="Agent Map (name->id)", visible=False)

    metadata = gr.Textbox(label="Metadata JSON", value="{}", lines=4)
    start_btn = gr.Button("Create Web Call Session", variant="primary")

    result_msg = gr.Textbox(label="Result Message")
    call_id_box = gr.Textbox(label="Call ID")
    instructions = gr.Textbox(label="Usage Instructions", lines=6)

    async def init_load():
        opts = await fetch_agents()
        if not opts:
            status_md = "**No agents found.** Ensure your API key has agents configured."
            return gr.update(choices=[]), json.dumps([], indent=2), status_md
        status_md = f"Loaded {len(opts)} agents."
        return gr.update(choices=[o[0] for o in opts], value=opts[0][0]), json.dumps(opts, indent=2), status_md

    def map_name_to_id(selected_name, mapping_json):
        try:
            arr = json.loads(mapping_json)
            for name, aid in arr:
                if name == selected_name:
                    return aid
        except Exception:
            return None
        return None

    async def handle_start(selected_name, mapping_json, metadata_json):
        agent_id = map_name_to_id(selected_name, mapping_json)
        msg, call_id, details = await start_call(agent_id, metadata_json)
        return msg, call_id, details

    # Events
    demo.load(init_load, outputs=[agents_dropdown, hidden_agent_map, status])
    refresh_btn.click(init_load, outputs=[agents_dropdown, hidden_agent_map, status])
    start_btn.click(handle_start, inputs=[agents_dropdown, hidden_agent_map, metadata], outputs=[result_msg, call_id_box, instructions])

if __name__ == "__main__":
    demo.queue().launch(server_name="0.0.0.0", server_port=7860)
