from fastapi import APIRouter, HTTPException, Depends
from retell import Retell
from config import settings
import logging
import asyncio

router = APIRouter(prefix="/agents", tags=["agents"])

# Initialize logger
logger = logging.getLogger(__name__)

def get_retell_client():
    """Dependency to get Retell client instance"""
    if not settings.retell_api_key:
        raise HTTPException(status_code=500, detail="Retell API key not configured")
    return Retell(api_key=settings.retell_api_key)

@router.get("/")
async def list_agents(retell_client: Retell = Depends(get_retell_client)):
    """List all available Retell AI agents for the authenticated account."""
    logger.info("Fetching agents from Retell API")
    try:
        loop = asyncio.get_running_loop()
        agents_response = await loop.run_in_executor(None, retell_client.agent.list)
    except Exception as e:
        logger.error(f"Error calling Retell API (list agents): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch agents: {e}")

    # Extract raw agent list
    if hasattr(agents_response, 'data'):
        raw_agents = agents_response.data
    elif isinstance(agents_response, list):
        raw_agents = agents_response
    else:
        raw_agents = []

    logger.info(f"Retrieved {len(raw_agents)} agents")

    formatted_agents = []
    for agent in raw_agents:
        formatted_agents.append({
            "agent_id": getattr(agent, 'agent_id', getattr(agent, 'id', None)),
            "agent_name": getattr(agent, 'agent_name', getattr(agent, 'name', 'Unknown')),
            "voice_id": getattr(agent, 'voice_id', None),
            "language": getattr(agent, 'language', 'en-US'),
            "response_engine": getattr(agent, 'response_engine', None)
        })

    return {"agents": formatted_agents, "count": len(formatted_agents)}

@router.get("/{agent_id}")
async def get_agent(agent_id: str, retell_client: Retell = Depends(get_retell_client)):
    """Get details of a specific agent by ID."""
    logger.info(f"Fetching agent details for ID: {agent_id}")
    try:
        loop = asyncio.get_running_loop()
        agent = await loop.run_in_executor(None, lambda: retell_client.agent.retrieve(agent_id))
    except Exception as e:
        logger.error(f"Error fetching agent {agent_id}: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent: {e}")

    return {
        "agent_id": getattr(agent, 'agent_id', getattr(agent, 'id', None)),
        "agent_name": getattr(agent, 'agent_name', getattr(agent, 'name', 'Unknown')),
        "voice_id": getattr(agent, 'voice_id', None),
        "language": getattr(agent, 'language', 'en-US'),
        "response_engine": getattr(agent, 'response_engine', None),
        "prompt": getattr(agent, 'prompt', None),
        "webhook_url": getattr(agent, 'webhook_url', None)
    }
