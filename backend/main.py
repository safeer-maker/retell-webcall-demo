"""
Retell Web Call Demo Backend

This FastAPI backend provides endpoints to interact with the Retell API
for managing agents and initiating web calls.
"""

import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Retell Web Call Demo API",
    description="Backend API for Retell web call demonstration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Retell SDK
try:
    from retell import Retell
except ImportError:
    logger.error("Retell SDK not installed. Please install with: pip install retell-sdk")
    raise

# Initialize Retell client
RETELL_API_KEY = os.getenv("RETELL_API_KEY")
if not RETELL_API_KEY:
    logger.warning("RETELL_API_KEY not found in environment variables")
    retell_client = None
else:
    retell_client = Retell(api_key=RETELL_API_KEY)

# Pydantic models
class WebCallRequest(BaseModel):
    agent_id: str
    
class WebCallResponse(BaseModel):
    call_id: str
    access_token: str

class Agent(BaseModel):
    agent_id: str
    agent_name: str
    voice_id: str
    language: str

@app.get("/")
async def root():
    """Root endpoint providing API information"""
    return {
        "message": "Retell Web Call Demo API",
        "version": "1.0.0",
        "endpoints": {
            "/agents": "GET - List all available agents",
            "/web-call": "POST - Create a new web call",
            "/health": "GET - Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_key_status = "configured" if RETELL_API_KEY else "missing"
    return {
        "status": "healthy",
        "api_key_status": api_key_status
    }

@app.get("/agents", response_model=List[Agent])
async def list_agents():
    """
    List all available agents from Retell API
    
    Returns:
        List of agents with their details
    """
    if not retell_client:
        raise HTTPException(
            status_code=500, 
            detail="Retell API key not configured. Please set RETELL_API_KEY environment variable."
        )
    
    try:
        # Get agents from Retell API
        agents_response = retell_client.agent.list()
        
        # Transform the response to match our Agent model
        agents = []
        for agent in agents_response:
            agents.append(Agent(
                agent_id=agent.agent_id,
                agent_name=agent.agent_name or f"Agent {agent.agent_id}",
                voice_id=agent.voice_id or "default",
                language=agent.language or "en-US"
            ))
        
        logger.info(f"Retrieved {len(agents)} agents")
        return agents
    
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch agents: {str(e)}"
        )

@app.post("/web-call", response_model=WebCallResponse)
async def create_web_call(request: WebCallRequest):
    """
    Create a new web call with the specified agent
    
    Args:
        request: WebCallRequest containing agent_id
        
    Returns:
        WebCallResponse with call_id and access_token
    """
    if not retell_client:
        raise HTTPException(
            status_code=500,
            detail="Retell API key not configured. Please set RETELL_API_KEY environment variable."
        )
    
    try:
        # Create web call using Retell API
        web_call_response = retell_client.call.create_web_call(
            agent_id=request.agent_id
        )
        
        logger.info(f"Created web call with ID: {web_call_response.call_id}")
        
        return WebCallResponse(
            call_id=web_call_response.call_id,
            access_token=web_call_response.access_token
        )
    
    except Exception as e:
        logger.error(f"Error creating web call: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create web call: {str(e)}"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting Retell Web Call Demo API on port {port}")
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True
    )