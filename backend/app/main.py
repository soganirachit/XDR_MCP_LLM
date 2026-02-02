"""FastAPI application entry point"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.models import ChatRequest, ChatResponse, HealthResponse
from app.api.chat import chat_endpoint
from app.dependencies import get_mcp_client, startup_checks
from app.utils.logger import setup_logging


# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    logger.info("Starting Wazuh LLM Orchestration Backend")
    
    # Startup checks
    await startup_checks()
    
    yield
    
    # Shutdown
    logger.info("Shutting down Wazuh LLM Orchestration Backend")


# Create FastAPI app
app = FastAPI(
    title="Wazuh LLM Orchestration API",
    description="AI-powered Wazuh SIEM analysis with thesys generative UI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    Returns backend status and MCP connection health
    """
    try:
        mcp_client = await get_mcp_client()
        mcp_connected = await mcp_client.check_health()
    except Exception as e:
        logger.error(f"MCP health check failed: {e}")
        mcp_connected = False
    
    return HealthResponse(
        status="healthy" if mcp_connected else "degraded",
        mcp_connected=mcp_connected
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    Processes user messages through LLM orchestration and returns thesys UI components
    """
    return await chat_endpoint(request)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Wazuh LLM Orchestration API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )
