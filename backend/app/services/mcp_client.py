"""MCP client for connecting to Wazuh MCP server - Enhanced error handling"""
import logging
import httpx
import uuid
import json
from typing import Dict, Any, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)


class MCPClient:
    """Client for Wazuh MCP server using JSON-RPC protocol"""

    def __init__(self, server_url: str):
        self.server_url = server_url.rstrip('/')
        self.mcp_endpoint = f"{self.server_url}/mcp"
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(
                connect=settings.MCP_CONNECTION_TIMEOUT,
                read=settings.MCP_REQUEST_TIMEOUT,
                write=settings.MCP_REQUEST_TIMEOUT,
                pool=settings.MCP_CONNECTION_TIMEOUT
            )
        )
        self.tools = []

    def _make_jsonrpc_request(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a JSON-RPC 2.0 request"""
        request = {
            "jsonrpc": "2.0",
            "method": method,
            "id": str(uuid.uuid4())
        }
        if params:
            request["params"] = params
        return request

    async def _call_mcp(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make a JSON-RPC call to the MCP server"""
        request = self._make_jsonrpc_request(method, params)
        headers = {
            "Content-Type": "application/json",
            "Origin": "http://localhost:8000"
        }

        try:
            response = await self.client.post(
                self.mcp_endpoint,
                json=request,
                headers=headers
            )
            response.raise_for_status()
            result = response.json()

            if "error" in result and result["error"]:
                error_info = result["error"]
                error_msg = error_info.get("message", str(error_info)) if isinstance(error_info, dict) else str(error_info)
                raise Exception(f"MCP error: {error_msg}")

            return result.get("result", {})

        except httpx.TimeoutException as e:
            logger.error(f"MCP request timed out for {method}: {e}")
            raise Exception(f"Request timed out after {settings.MCP_REQUEST_TIMEOUT}s")
        except httpx.HTTPStatusError as e:
            logger.error(f"MCP HTTP error for {method}: {e.response.status_code}")
            raise Exception(f"HTTP error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"MCP call failed for {method}: {e}")
            raise

    async def connect(self):
        """Establish connection and list available tools"""
        try:
            # List available tools using JSON-RPC
            result = await self._call_mcp("tools/list")
            self.tools = result.get("tools", [])
            logger.info(f"MCP connected with {len(self.tools)} tools")
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
        """Call an MCP tool using JSON-RPC with enhanced response parsing"""
        try:
            logger.debug(f"Calling MCP tool: {tool_name} with params: {parameters}")

            result = await self._call_mcp("tools/call", {
                "name": tool_name,
                "arguments": parameters
            })

            # Handle None result
            if result is None:
                return {"error": "No response from tool", "tool": tool_name}

            # Extract content from MCP response
            if "content" in result:
                content = result["content"]
                if isinstance(content, list) and len(content) > 0:
                    # Get the text content from the first item
                    first_content = content[0]
                    if isinstance(first_content, dict) and "text" in first_content:
                        text = first_content["text"]

                        # MCP responses often have a prefix like "Agent Ports:\n{json}"
                        # Try to extract JSON from the text
                        json_text = text

                        # Look for JSON object start
                        if "{" in text:
                            json_start = text.find("{")
                            json_text = text[json_start:]

                        # Try to parse as JSON
                        try:
                            parsed = json.loads(json_text)
                            # Check if parsed result contains an error
                            if isinstance(parsed, dict) and "error" in parsed:
                                logger.warning(f"Tool {tool_name} returned error: {parsed['error']}")
                            logger.info(f"Tool {tool_name} returned data successfully")
                            return parsed
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse JSON from {tool_name}: {e}")
                            # Return the raw text for the LLM to interpret
                            return {"text": text, "raw": True}
                    return first_content
                return {"content": content}

            return result

        except Exception as e:
            error_msg = str(e)
            logger.error(f"MCP tool call failed ({tool_name}): {error_msg}")
            # Return error as dict instead of raising
            return {
                "error": error_msg,
                "tool": tool_name,
                "parameters": parameters,
                "status": "failed"
            }

    def get_tools_for_openai(self) -> List[Dict[str, Any]]:
        """Format tools for OpenAI function calling"""
        formatted_tools = []
        for tool in self.tools:
            # Get the input schema
            input_schema = tool.get("inputSchema", tool.get("parameters", {}))

            # Ensure schema has required fields for OpenAI
            if not input_schema:
                input_schema = {"type": "object", "properties": {}}

            if "type" not in input_schema:
                input_schema["type"] = "object"

            formatted_tools.append({
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool.get("description", f"Execute {tool['name']} tool"),
                    "parameters": input_schema
                }
            })

        return formatted_tools

    def get_tool_names(self) -> List[str]:
        """Get list of available tool names"""
        return [tool["name"] for tool in self.tools]

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
