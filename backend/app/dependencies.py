"""Dependency injection and startup checks"""
import logging
from app.services.mcp_client import MCPClient
from app.config import settings

logger = logging.getLogger(__name__)

# Global MCP client instance
_mcp_client = None


async def get_mcp_client() -> MCPClient:
    """Get or create MCP client instance"""
    global _mcp_client
    if _mcp_client is None:
        _mcp_client = MCPClient(settings.MCP_SERVER_URL)
        await _mcp_client.connect()
    return _mcp_client


async def startup_checks():
    """Run startup checks"""
    logger.info("Running startup checks...")
    
    # Check OpenAI API key
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "sk-proj-your-key-here":
        logger.error("OPENAI_API_KEY not configured!")
        raise ValueError("OPENAI_API_KEY is required")
    
    # Check MCP connection
    try:
        mcp_client = await get_mcp_client()
        is_healthy = await mcp_client.check_health()
        if is_healthy:
            logger.info(f"✅ MCP server connected: {settings.MCP_SERVER_URL}")
        else:
            logger.warning(f"⚠️  MCP server unhealthy: {settings.MCP_SERVER_URL}")
    except Exception as e:
        logger.error(f"❌ MCP connection failed: {e}")
        logger.warning("Backend will start but MCP features may not work")
    
    logger.info("Startup checks complete")
