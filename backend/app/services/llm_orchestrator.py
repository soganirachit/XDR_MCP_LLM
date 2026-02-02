"""LLM orchestration with OpenAI and MCP tools"""
import logging
import json
from typing import Dict, Any, List
from openai import AsyncOpenAI

from app.config import settings
from app.dependencies import get_mcp_client

logger = logging.getLogger(__name__)


class LLMOrchestrator:
    """Orchestrates LLM calls with MCP tool integration"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT
        )
        self.system_prompt = self._build_system_prompt()
    
    def _build_system_prompt(self) -> str:
        """Build system prompt with guardrails"""
        return """You are a Wazuh SIEM analysis assistant. ONLY answer questions about:
- Wazuh security alerts and events
- Agent status and monitoring
- Security rules and compliance
- Vulnerabilities and CVEs
- File integrity monitoring
- Log analysis and SIEM data
- General cybersecurity concepts related to Wazuh

For ANY other topics, respond: "I can only assist with Wazuh SIEM and security monitoring questions."

When presenting data:
- For alerts: Include severity, agent, rule_id, timestamp
- For metrics: Provide data suitable for visualization
- For lists: Format as structured data
- Always explain findings in security context
- Tag your responses with data type for proper visualization:
  * [ALERTS] for security alerts
  * [AGENTS] for agent status
  * [VULNERABILITIES] for CVE data
  * [METRICS] for statistics
  * [RULES] for rule information
  * [FILES] for file integrity data
"""
    
    async def process(
        self,
        message: str,
        context: List[Dict[str, str]],
        session_id: str
    ) -> Dict[str, Any]:
        """Process user message with LLM and MCP tools"""
        
        # Get MCP tools
        mcp_client = await get_mcp_client()
        tools = mcp_client.get_tools_for_openai()
        
        # Build messages
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(context)
        messages.append({"role": "user", "content": message})
        
        tool_calls_made = 0
        max_iterations = settings.MAX_TOOL_ITERATIONS
        
        for iteration in range(max_iterations):
            # Call OpenAI
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                tools=tools if tools else None,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            assistant_message = response.choices[0].message
            
            # Check if tool calls are needed
            if not assistant_message.tool_calls:
                # No more tool calls, return final response
                return {
                    "message": assistant_message.content,
                    "tool_calls_made": tool_calls_made,
                    "raw_data": {}
                }
            
            # Process tool calls
            messages.append(assistant_message)
            
            for tool_call in assistant_message.tool_calls:
                tool_calls_made += 1
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)
                
                logger.info(f"Calling MCP tool: {tool_name}")
                
                try:
                    tool_result = await mcp_client.call_tool(tool_name, tool_args)
                    result_content = json.dumps(tool_result)
                except Exception as e:
                    logger.error(f"Tool call failed: {e}")
                    result_content = json.dumps({"error": str(e)})
                
                # Add tool result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result_content
                })
        
        # Max iterations reached
        logger.warning(f"Max iterations ({max_iterations}) reached")
        return {
            "message": "Query too complex. Please simplify your request.",
            "tool_calls_made": tool_calls_made,
            "raw_data": {}
        }
