"""MCP client for connecting to Wazuh MCP server"""
import logging
import httpx
from typing import Dict, Any, List

from app.config import settings

logger = logging.getLogger(__name__)


class MCPClient:
    """Client for Wazuh MCP server"""
    
    def __init__(self, server_url: str):
        self.server_url = server_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=settings.MCP_REQUEST_TIMEOUT)
        self.tools = []
    
    async def connect(self):
        """Establish connection and list available tools"""
        try:
            # List available tools
            response = await self.client.get(f"{self.server_url}/tools")
            if response.status_code == 200:
                self.tools = response.json().get("tools", [])
                logger.info(f"MCP connected with {len(self.tools)} tools")
            else:
                logger.warning(f"Failed to list MCP tools: {response.status_code}")
        except Exception as e:
            logger.error(f"MCP connection error: {e}")
            raise
    
    async def check_health(self) -> bool:
        """Check if MCP server is healthy"""
        try:
            response = await self.client.get(
                f"{self.server_url}/health",
                timeout=settings.MCP_CONNECTION_TIMEOUT
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"MCP health check failed: {e}")
            return False
    
    async def call_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool"""
        try:
            response = await self.client.post(
                f"{self.server_url}/tools/{tool_name}",
                json={"parameters": parameters}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"MCP tool call failed ({tool_name}): {e}")
            raise
    
    def get_tools_for_openai(self) -> List[Dict[str, Any]]:
        """Format tools for OpenAI function calling"""
        return [
            {
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool.get("description", ""),
                    "parameters": tool.get("parameters", {})
                }
            }
            for tool in self.tools
        ]
