"""LLM orchestration with OpenAI and MCP tools - Enhanced for multi-step reasoning"""
import logging
import json
from typing import Dict, Any, List, Optional, Union
from openai import AsyncOpenAI

from app.config import settings
from app.dependencies import get_mcp_client

logger = logging.getLogger(__name__)

# Tool categories for better routing
TOOL_CATEGORIES = {
    "agent_management": [
        "get_wazuh_agents",
        "get_wazuh_running_agents",
        "check_agent_health",
        "get_agent_processes",
        "get_agent_ports",
        "get_agent_configuration",
    ],
    "vulnerabilities": [
        "get_wazuh_vulnerabilities",
        "get_wazuh_critical_vulnerabilities",
        "get_wazuh_vulnerability_summary",
    ],
    "alerts_events": [
        "get_wazuh_alerts",
        "get_wazuh_alert_summary",
        "analyze_alert_patterns",
        "search_security_events",
    ],
    "security_analysis": [
        "analyze_security_threat",
        "check_ioc_reputation",
        "perform_risk_assessment",
        "get_top_security_threats",
        "generate_security_report",
        "run_compliance_check",
    ],
    "manager_stats": [
        "get_wazuh_statistics",
        "get_wazuh_weekly_stats",
        "get_wazuh_cluster_health",
        "get_wazuh_cluster_nodes",
        "get_wazuh_rules_summary",
        "get_wazuh_remoted_stats",
        "get_wazuh_log_collector_stats",
        "search_wazuh_manager_logs",
        "get_wazuh_manager_error_logs",
    ],
    "system": [
        "validate_wazuh_connection"
    ]
}

# Tools confirmed working
WORKING_TOOLS = [
    "get_wazuh_running_agents",
    "get_wazuh_vulnerabilities",
    "get_wazuh_critical_vulnerabilities",
    "get_wazuh_vulnerability_summary",
    "get_agent_processes",
    "get_agent_ports",
    "get_wazuh_weekly_stats",
    "get_wazuh_remoted_stats",
    "get_wazuh_manager_error_logs",
    "validate_wazuh_connection",
]


class LLMOrchestrator:
    """Orchestrates LLM calls with MCP tool integration - Enhanced for complex queries"""

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT
        )
        self.tool_results_cache: Dict[str, Any] = {}
        self.failed_tools: List[str] = []

    def _build_system_prompt(self, available_tools: List[str]) -> str:
        """Build system prompt optimized for multi-step reasoning and tool chaining"""

        # Categorize available tools
        tool_sections = []
        for category, tools in TOOL_CATEGORIES.items():
            available_in_category = [t for t in tools if t in available_tools]
            if available_in_category:
                tool_sections.append(f"  - {category.replace('_', ' ').title()}: {', '.join(available_in_category)}")

        tools_info = "\n".join(tool_sections) if tool_sections else "  No tools available"
        working_list = [t for t in WORKING_TOOLS if t in available_tools]

        return f"""You are an expert Wazuh SIEM security analyst with access to {len(available_tools)} MCP tools. You excel at complex multi-step investigations.

## Your Role
You are a security operations analyst who can:
- Investigate security incidents by chaining multiple data sources
- Correlate information across agents, processes, ports, and vulnerabilities
- Provide detailed forensic analysis with actionable insights
- Answer complex questions that require multiple tool calls

## Available Tools
{tools_info}

## CRITICAL: Multi-Step Query Handling
For complex questions, you MUST chain tool calls intelligently:

### Example 1: "What process is using port 52010 on agent 012?"
1. First call `get_agent_ports` with agent_id="012" to get all ports and their PIDs
2. Find the PID using port 52010 from the results
3. Then call `get_agent_processes` with agent_id="012" to get process details
4. Match the PID to find the exact process name, user, command line, etc.
5. Provide a comprehensive answer with all relevant details

### Example 2: "Which agents have critical vulnerabilities?"
1. Call `get_wazuh_critical_vulnerabilities` to get all critical CVEs
2. Extract the unique agent IDs from the results
3. Call `get_wazuh_running_agents` to get agent details (names, IPs, OS)
4. Correlate and present: Agent Name -> CVE -> Severity -> Description

### Example 3: "Is there any suspicious process on agent 000?"
1. Call `get_agent_processes` for agent 000
2. Analyze the results for suspicious indicators:
   - Processes running from /tmp or unusual locations
   - Base64 encoded commands
   - Processes with high resource usage
   - Unknown or obfuscated process names
3. Call `get_agent_ports` to check for unusual network connections
4. Provide security assessment with findings

## Data Correlation Instructions
When you receive tool results:
1. **Parse the JSON data** carefully to extract relevant fields
2. **Cross-reference** data between different tool results (e.g., match PIDs, agent IDs)
3. **Filter and aggregate** - don't just dump raw data, provide insights
4. **Identify patterns** - look for anomalies, correlations, security issues

## Response Guidelines
1. **Be thorough**: Make ALL necessary tool calls before answering
2. **Chain intelligently**: Use results from one tool to inform the next query
3. **Summarize findings**: Don't just return raw JSON - analyze and explain
4. **Provide context**: Explain what the data means from a security perspective
5. **Be specific**: Include exact values (PIDs, ports, CVE IDs, timestamps)

## Tool Usage Best Practices
- **get_agent_ports**: Returns ports with local_ip, local_port, remote_ip, remote_port, state, pid, process
- **get_agent_processes**: Returns processes with pid, name, cmd, user, state, ppid, nice, etc.
- **get_wazuh_running_agents**: Returns agent id, name, ip, os info, status, version
- **get_wazuh_vulnerabilities**: Returns CVE details with agent_id, severity, description

## Working Tools (Reliable)
{', '.join(working_list)}

## Important Security Analysis Tips
- High ports (>49152) are typically ephemeral/dynamic
- Ports 0-1023 are privileged and require root
- Common suspicious ports: 4444 (meterpreter), 5555 (adb), 6666, 31337
- Check process paths: /tmp, /dev/shm, /var/tmp are suspicious locations
- Look for processes with encoded/obfuscated command lines

## Output Tags for UI
Tag your responses for proper visualization:
- [AGENTS] for agent data
- [VULNERABILITIES] for CVE data
- [METRICS] for statistics
- [PROCESSES] for process lists
- [PORTS] for network connections

Remember: You have up to {settings.MAX_TOOL_ITERATIONS} iterations to gather all needed data. Use them wisely!
"""

    async def process(
        self,
        message: str,
        context: List[Dict[str, str]],
        session_id: str
    ) -> Dict[str, Any]:
        """Process user message with enhanced multi-step reasoning"""

        # Get MCP tools
        mcp_client = await get_mcp_client()
        tools = mcp_client.get_tools_for_openai()

        # Get tool names for system prompt
        tool_names = [t["function"]["name"] for t in tools]

        # Build dynamic system prompt with available tools
        system_prompt = self._build_system_prompt(tool_names)

        # Build messages with conversation context
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(context)
        messages.append({"role": "user", "content": message})

        tool_calls_made = 0
        max_iterations = settings.MAX_TOOL_ITERATIONS
        raw_data: Dict[str, Any] = {}
        tool_errors: List[str] = []
        tool_chain: List[str] = []  # Track tool call sequence

        logger.info(f"Processing query: {message[:100]}... (session: {session_id})")

        for iteration in range(max_iterations):
            logger.info(f"Iteration {iteration + 1}/{max_iterations}")

            # Call OpenAI with function calling
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                tools=tools if tools else None,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=0.1  # Low temperature for consistent reasoning
            )

            assistant_message = response.choices[0].message

            # Check if tool calls are needed
            if not assistant_message.tool_calls:
                # No more tool calls, return final response
                final_message = assistant_message.content or ""

                # Add tool chain info if multiple tools were used
                if len(tool_chain) > 1:
                    chain_info = f"\n\n*Investigation path: {' → '.join(tool_chain)}*"
                    final_message += chain_info

                # Append error summary if there were tool failures
                if tool_errors:
                    error_summary = "\n\n**Note:** Some data sources were unavailable:\n" + "\n".join(f"- {e}" for e in tool_errors[:3])
                    if len(tool_errors) > 3:
                        error_summary += f"\n- ...and {len(tool_errors) - 3} more"
                    final_message += error_summary

                logger.info(f"Completed with {tool_calls_made} tool calls: {tool_chain}")

                return {
                    "message": final_message,
                    "tool_calls_made": tool_calls_made,
                    "raw_data": raw_data,
                    "tool_chain": tool_chain
                }

            # Process tool calls
            messages.append(assistant_message)

            # Execute each tool call
            tool_results = []
            for tool_call in assistant_message.tool_calls:
                tool_calls_made += 1
                tool_name = tool_call.function.name
                tool_chain.append(tool_name)

                try:
                    tool_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    tool_args = {}

                logger.info(f"[{iteration + 1}] Calling: {tool_name}({json.dumps(tool_args)})")

                result_content = await self._execute_tool_with_fallback(
                    mcp_client, tool_name, tool_args, tool_errors
                )

                # Store raw data for potential UI visualization
                if isinstance(result_content, dict) and "error" not in result_content:
                    raw_data[f"{tool_name}_{tool_calls_made}"] = result_content

                # Format result for LLM consumption
                result_json = json.dumps(result_content) if isinstance(result_content, dict) else str(result_content)

                tool_results.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result_json
                })

            # Add all tool results to messages for next iteration
            messages.extend(tool_results)

        # Max iterations reached - try to provide useful response
        logger.warning(f"Max iterations ({max_iterations}) reached for session {session_id}")

        # Make one final call to summarize what we have
        messages.append({
            "role": "user",
            "content": "Please summarize the findings from the data you've collected so far, even if incomplete."
        })

        try:
            final_response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=0.1
            )
            final_message = final_response.choices[0].message.content or "Investigation incomplete."
        except:
            final_message = "Investigation reached maximum iterations. Partial data collected."

        return {
            "message": final_message + f"\n\n*Investigation path: {' → '.join(tool_chain)}*",
            "tool_calls_made": tool_calls_made,
            "raw_data": raw_data,
            "tool_chain": tool_chain
        }

    async def _execute_tool_with_fallback(
        self,
        mcp_client,
        tool_name: str,
        tool_args: Dict[str, Any],
        tool_errors: List[str]
    ) -> Dict[str, Any]:
        """Execute a tool with error handling and detailed logging"""
        try:
            result = await mcp_client.call_tool(tool_name, tool_args)

            # Handle None or non-dict results
            if result is None:
                return {"error": "No response from tool", "tool": tool_name, "status": "failed"}

            if not isinstance(result, dict):
                # Return raw result wrapped in dict
                return {"data": result, "tool": tool_name, "status": "success"}

            # Check for explicit error field
            if "error" in result and result["error"]:
                error_msg = str(result.get("error", "Unknown error"))
                self._handle_tool_error(tool_name, error_msg, tool_errors)
                return {
                    "error": error_msg,
                    "tool": tool_name,
                    "args": tool_args,
                    "status": "failed",
                    "suggestion": self._get_error_suggestion(tool_name, error_msg)
                }

            # Check for Wazuh API error code (error != 0 means failure)
            wazuh_error = result.get("error")
            if isinstance(wazuh_error, int) and wazuh_error != 0:
                error_msg = result.get("message", f"Wazuh error code: {wazuh_error}")
                self._handle_tool_error(tool_name, error_msg, tool_errors)
                return {
                    "error": error_msg,
                    "tool": tool_name,
                    "args": tool_args,
                    "status": "failed"
                }

            # Check for empty results in Wazuh response structure
            data = result.get("data", {})
            if isinstance(data, dict):
                affected_items = data.get("affected_items", [])
                if isinstance(affected_items, list) and len(affected_items) == 0:
                    return {
                        "message": f"No data found for {tool_name}",
                        "tool": tool_name,
                        "args": tool_args,
                        "data": {"affected_items": []},
                        "status": "empty"
                    }

            logger.info(f"Tool {tool_name} returned successfully")
            return result

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Tool call failed ({tool_name}): {error_msg}")
            self._handle_tool_error(tool_name, error_msg, tool_errors)
            return {
                "error": error_msg,
                "tool": tool_name,
                "args": tool_args,
                "status": "failed",
                "suggestion": self._get_error_suggestion(tool_name, error_msg)
            }

    def _handle_tool_error(self, tool_name: str, error_msg: Any, tool_errors: List[str]):
        """Handle and categorize tool errors"""
        # Ensure error_msg is a string
        error_str = str(error_msg) if error_msg else "Unknown error"

        if "404" in error_str:
            tool_errors.append(f"{tool_name}: Endpoint not available")
        elif "503" in error_str:
            tool_errors.append(f"{tool_name}: Service temporarily unavailable (circuit breaker)")
        elif "Indexer" in error_str or "indexer" in error_str:
            tool_errors.append(f"{tool_name}: Requires Wazuh Indexer")
        elif "timeout" in error_str.lower():
            tool_errors.append(f"{tool_name}: Request timed out")
        elif "not found" in error_str.lower():
            tool_errors.append(f"{tool_name}: Resource not found")
        else:
            tool_errors.append(f"{tool_name}: {error_str[:80]}")

    def _get_error_suggestion(self, tool_name: str, error_msg: str) -> str:
        """Get helpful suggestion based on error"""
        if "503" in error_msg:
            return "The service may be temporarily overloaded. Try a different query or wait a moment."
        if "404" in error_msg:
            return "This API endpoint may not be available in your Wazuh version."
        if "agent" in tool_name.lower() and "not found" in error_msg.lower():
            return "The specified agent may not exist. Try get_wazuh_running_agents first to list available agents."
        return "Try an alternative approach or check the Wazuh server status."

    def get_tool_status(self) -> Dict[str, Any]:
        """Get status of tool availability"""
        return {
            "working_tools": WORKING_TOOLS,
            "categories": TOOL_CATEGORIES,
            "failed_tools": self.failed_tools
        }
