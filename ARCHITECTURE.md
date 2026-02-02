# System Architecture

## Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │─────→│   Frontend   │─────→│   Backend   │─────→│  OpenAI API  │
│  Port 3001  │←─────│  React+CSS   │←─────│   FastAPI   │←─────│   (GPT-4o)   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                            ↑                      ↓
                            │                      │
                            │                ┌─────────────┐
                            └────────────────│  MCP Server │
                              thesys UI      │  Wazuh Data │
                              components     │ (Port 3000) │
                                            └─────────────┘
```

## Component Overview

### Frontend (React + TypeScript)
- **ChatInterface**: Main chat container managing conversation state
- **MessageList**: Displays message history with auto-scroll
- **MessageBubble**: Individual message with user/assistant styling
- **InputArea**: Text input with keyboard shortcuts (Enter to send)
- **ThesysRenderer**: Renders various data visualization components
- **LoadingIndicator**: Shows AI is thinking

### Backend (FastAPI)
- **Config**: Environment variable management with validation
- **Models**: Pydantic models for request/response validation
- **Dependencies**: Dependency injection and startup checks
- **Endpoints**:
  - `GET /health` - Health check with MCP status
  - `POST /chat` - Main chat endpoint
  - `GET /` - API documentation
- **Services**:
  - `LLMOrchestrator`: OpenAI integration with tool calling
  - `MCPClient`: Wazuh MCP server communication
  - `GuardrailsChecker`: Query validation and filtering
  - `SessionManager`: In-memory session context
  - `ThesysGenerator`: UI component generation from LLM responses

### Data Models

**ChatRequest**
```json
{
  "session_id": "uuid",
  "message": "user query"
}
```

**ChatResponse**
```json
{
  "session_id": "uuid",
  "message": "response text",
  "components": [
    {
      "type": "text|alert-cards|agent-dashboard|chart|table|metrics",
      "data": {...},
      "config": {...}
    }
  ],
  "timestamp": "ISO-8601",
  "tool_calls_made": 2,
  "processing_time_ms": 1234.5
}
```

## Query Flow

1. **User Input**: User types query in chat UI
2. **Frontend**: Sends `ChatRequest` to Backend `/chat` endpoint
3. **Guardrails**: Backend validates query against security guardrails
4. **Session Context**: Retrieves conversation history
5. **LLM Processing**:
   - Calls OpenAI with system prompt + context + user message
   - OpenAI identifies required MCP tools
   - Backend calls MCP tools to fetch Wazuh data
   - LLM processes data and formulates response
6. **Component Generation**: Converts LLM response to thesys UI components
7. **Frontend Rendering**: Displays message + interactive visualizations
8. **Session Update**: Stores message in session for context

## Security & Guardrails

### Query Filtering
- Blocks weather, sports, entertainment, jokes
- Requires security keywords for long queries
- Whitelist of allowed security topics
- Configurable via `STRICT_GUARDRAILS` env var

### API Protection
- CORS enabled for frontend origins only
- Request timeout protection
- Max concurrent requests limiting
- Rate limiting per minute

## Performance Optimization

- Session messages limited to last 10 pairs (configurable)
- In-memory session storage (fast access)
- MCP connection pooled globally
- Async/await throughout for concurrency
- Tool iteration limits (max 5 by default)

## Error Handling

- Graceful fallbacks for MCP connection failures
- Rejection messages for blocked queries
- Comprehensive error logging with JSON format
- HTTP error responses with descriptive messages
