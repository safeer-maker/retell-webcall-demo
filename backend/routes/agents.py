from fastapi import APIRouter, HTTPException, Depends
from retell import Retell
from config import settings
import logging

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
    """
    List all available Retell AI agents for the authenticated account.
    
    Returns:
        List of agent objects with their details
    """
    try:
        logger.info("Fetching agents from Retell API")
        agents_response = retell_client.agent.list()
        
        # Extract agents from the response
        agents = []
        if hasattr(agents_response, 'data'):
            agents = agents_response.data
        elif isinstance(agents_response, list):
            agents = agents_response
        
        logger.info(f"Retrieved {len(agents)} agents")
        
        # Format agents for frontend consumption
        formatted_agents = []
        for agent in agents:
            formatted_agent = {
                "agent_id": agent.agent_id if hasattr(agent, 'agent_id') else getattr(agent, 'id', None),
                "agent_name": getattr(agent, 'agent_name', getattr(agent, 'name', 'Unknown')),
                "voice_id": getattr(agent, 'voice_id', None),
                "language": getattr(agent, 'language', 'en-US'),
                "response_engine": getattr(agent, 'response_engine', None)
            }
            formatted_agents.append(formatted_agent)
        
        return {
            "agents": formatted_agents,
            "count": len(formatted_agents)
        }
        
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch agents: {str(e)}"
        )

@router.get("/{agent_id}")
async def get_agent(agent_id: str, retell_client: Retell = Depends(get_retell_client)):
    """
    Get details of a specific agent by ID.
    
    Args:
        agent_id: The ID of the agent to retrieve
        
    Returns:
        Agent object with details
    """
    try:
        logger.info(f"Fetching agent details for ID: {agent_id}")
        agent = retell_client.agent.retrieve(agent_id)
        
        formatted_agent = {
            "agent_id": agent.agent_id if hasattr(agent, 'agent_id') else getattr(agent, 'id', None),
            "agent_name": getattr(agent, 'agent_name', getattr(agent, 'name', 'Unknown')),
            "voice_id": getattr(agent, 'voice_id', None),
            "language": getattr(agent, 'language', 'en-US'),
            "response_engine": getattr(agent, 'response_engine', None),
            "prompt": getattr(agent, 'prompt', None),
            "webhook_url": getattr(agent, 'webhook_url', None)
        }
        
        return formatted_agent
        
    except Exception as e:
        logger.error(f"Error fetching agent {agent_id}: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch agent: {str(e)}"
        )
