from fastapi import APIRouter, HTTPException, Depends
from retell import Retell
from pydantic import BaseModel
from config import settings
import logging

router = APIRouter(prefix="/calls", tags=["calls"])

# Initialize logger
logger = logging.getLogger(__name__)

class CreateWebCallRequest(BaseModel):
    agent_id: str
    metadata: dict = {}

class WebCallResponse(BaseModel):
    call_id: str
    access_token: str
    sample_rate: int = 24000

def get_retell_client():
    """Dependency to get Retell client instance"""
    if not settings.retell_api_key:
        raise HTTPException(status_code=500, detail="Retell API key not configured")
    return Retell(api_key=settings.retell_api_key)

@router.post("/create-web-call", response_model=WebCallResponse)
async def create_web_call(
    request: CreateWebCallRequest,
    retell_client: Retell = Depends(get_retell_client)
):
    """
    Create a new web call session with the specified agent.
    
    Args:
        request: Contains agent_id and optional metadata
        
    Returns:
        Web call details including access token and call ID
    """
    try:
        logger.info(f"Creating web call for agent: {request.agent_id}")
        
        # Create the web call using Retell SDK
        # Offload potentially blocking SDK call to thread pool
        import asyncio
        loop = asyncio.get_running_loop()
        web_call = await loop.run_in_executor(
            None,
            lambda: retell_client.call.create_web_call(
                agent_id=request.agent_id,
                metadata=request.metadata
            )
        )
        
        logger.info(f"Web call created successfully: {web_call.call_id}")
        
        return WebCallResponse(
            call_id=web_call.call_id,
            access_token=web_call.access_token,
            sample_rate=getattr(web_call, 'sample_rate', 24000)
        )
        
    except Exception as e:
        logger.error(f"Error creating web call: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=404, 
                detail=f"Agent {request.agent_id} not found"
            )
        elif "unauthorized" in str(e).lower():
            raise HTTPException(
                status_code=401, 
                detail="Invalid API key or insufficient permissions"
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to create web call: {str(e)}"
            )

@router.get("/{call_id}")
async def get_call_details(
    call_id: str, 
    retell_client: Retell = Depends(get_retell_client)
):
    """
    Get details of a specific call by ID.
    
    Args:
        call_id: The ID of the call to retrieve
        
    Returns:
        Call object with details
    """
    try:
        logger.info(f"Fetching call details for ID: {call_id}")
        call = retell_client.call.retrieve(call_id)
        
        return {
            "call_id": call.call_id,
            "agent_id": getattr(call, 'agent_id', None),
            "call_status": getattr(call, 'call_status', None),
            "start_timestamp": getattr(call, 'start_timestamp', None),
            "end_timestamp": getattr(call, 'end_timestamp', None),
            "duration": getattr(call, 'duration', None),
            "metadata": getattr(call, 'metadata', {})
        }
        
    except Exception as e:
        logger.error(f"Error fetching call {call_id}: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Call {call_id} not found")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch call: {str(e)}"
        )

@router.delete("/{call_id}")
async def end_call(
    call_id: str, 
    retell_client: Retell = Depends(get_retell_client)
):
    """
    End an active call.
    
    Args:
        call_id: The ID of the call to end
        
    Returns:
        Success message
    """
    try:
        logger.info(f"Ending call: {call_id}")
        
        # Note: The actual method name might vary based on the SDK version
        # Check the Retell SDK documentation for the correct method
        result = retell_client.call.end_call(call_id)
        
        return {"message": f"Call {call_id} ended successfully"}
        
    except Exception as e:
        logger.error(f"Error ending call {call_id}: {str(e)}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Call {call_id} not found")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to end call: {str(e)}"
        )
