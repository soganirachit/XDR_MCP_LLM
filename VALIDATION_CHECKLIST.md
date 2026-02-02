# Validation Checklist

Before deploying, verify each of these items:

## Environment Setup
- [ ] `.env` file created
- [ ] `OPENAI_API_KEY` is set to valid key from platform.openai.com
- [ ] `MCP_SERVER_URL` is accessible (tested with curl)
- [ ] All required env vars are set (no placeholders remaining)
- [ ] `CORS_ORIGINS` includes your frontend URL

## Prerequisites Installed
- [ ] Docker installed and running (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] curl available for health checks
- [ ] bash/zsh available for setup script

## Project Structure
- [ ] `backend/` directory exists with all Python files
- [ ] `frontend/` directory exists with all React files
- [ ] `docker-compose.yml` exists and is valid YAML
- [ ] `setup.sh` is executable (`chmod +x setup.sh`)
- [ ] `.env.example` file present
- [ ] `.gitignore` configured properly

## Backend Files
- [ ] `app/main.py` - FastAPI entry point
- [ ] `app/config.py` - Configuration management
- [ ] `app/models.py` - Pydantic models
- [ ] `app/dependencies.py` - Dependency injection
- [ ] `app/api/chat.py` - Chat endpoint
- [ ] `app/services/llm_orchestrator.py` - OpenAI integration
- [ ] `app/services/mcp_client.py` - MCP client
- [ ] `app/services/guardrails.py` - Query filtering
- [ ] `app/services/session_manager.py` - Session storage
- [ ] `app/services/thesys_generator.py` - UI generation
- [ ] `app/utils/logger.py` - Logging setup
- [ ] `requirements.txt` - Python dependencies
- [ ] `Dockerfile` - Backend container definition

## Frontend Files
- [ ] `src/main.tsx` - React entry point
- [ ] `src/App.tsx` - Main app component
- [ ] `src/index.css` - Global styles
- [ ] `src/components/ChatInterface.tsx` - Chat container
- [ ] `src/components/MessageList.tsx` - Message display
- [ ] `src/components/MessageBubble.tsx` - Individual message
- [ ] `src/components/InputArea.tsx` - User input
- [ ] `src/components/ThesysRenderer.tsx` - Data visualization
- [ ] `src/components/LoadingIndicator.tsx` - Loading state
- [ ] `src/types/index.ts` - TypeScript types
- [ ] `src/utils/api.ts` - API client
- [ ] `package.json` - Dependencies configured
- [ ] `vite.config.ts` - Vite configuration
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `tailwind.config.js` - Tailwind config
- [ ] `postcss.config.js` - PostCSS config
- [ ] `index.html` - HTML entry point
- [ ] `Dockerfile` - Frontend container definition

## Docker Configuration
- [ ] `docker-compose.yml` has correct service definitions
- [ ] Environment variables properly passed to containers
- [ ] Port mappings correct (8000 for backend, 3001 for frontend)
- [ ] Health checks configured
- [ ] Networking properly set up
- [ ] `host.docker.internal` used for MCP on Mac/Windows

## Ports & Networking
- [ ] Port 8000 is available
- [ ] Port 3001 is available
- [ ] Firewall allows outbound to OpenAI API
- [ ] Firewall allows connection to MCP server
- [ ] MCP server is running on http://localhost:3000

## Build & Startup Tests
- [ ] `docker-compose build` completes without errors
- [ ] `docker-compose up -d` starts services successfully
- [ ] No port conflicts on startup
- [ ] Backend container starts and stays running
- [ ] Frontend container starts and stays running

## Runtime Verification
- [ ] `curl http://localhost:8000/health` returns `status: healthy`
- [ ] Backend logs show "MCP server connected"
- [ ] `curl http://localhost:3001` returns HTML
- [ ] Frontend loads at http://localhost:3001 in browser
- [ ] No JavaScript errors in browser console
- [ ] API documentation available at http://localhost:8000/docs

## Functional Tests
- [ ] Can type message in chat interface
- [ ] Message sends and loading indicator appears
- [ ] Backend receives request (check logs)
- [ ] OpenAI API is called (check for token count in logs)
- [ ] Response appears in chat within 30 seconds
- [ ] Response includes text content
- [ ] Response includes thesys components
- [ ] User and assistant messages display correctly
- [ ] Timestamps appear on messages
- [ ] Can send multiple messages in sequence

## Security Tests
- [ ] Non-security query is blocked by guardrails
- [ ] Rejection message displayed for blocked queries
- [ ] CORS headers correctly restrict access
- [ ] API key is not exposed in logs
- [ ] API key is not sent to frontend
- [ ] Session IDs are regenerated per user

## Performance Tests
- [ ] First response within 30 seconds
- [ ] Processing time logged and displayed
- [ ] Multiple concurrent requests handled
- [ ] Chat UI remains responsive during processing
- [ ] No memory leaks after 10+ messages
- [ ] Old sessions are cleaned up

## Guardrails Tests
- [ ] "Show me alerts" query is allowed ✅
- [ ] "What's the weather?" query is blocked ✅
- [ ] "Tell me a joke" query is blocked ✅
- [ ] "Calculate 2+2" query is blocked ✅
- [ ] Security-related questions pass through ✅
- [ ] `STRICT_GUARDRAILS=false` disables checks ✅

## Documentation
- [ ] README.md is complete and accurate
- [ ] ARCHITECTURE.md explains data flow
- [ ] DEPLOYMENT.md has setup instructions
- [ ] All environment variables documented
- [ ] Example queries provided
- [ ] Troubleshooting guide included

## Cleanup & Final Steps
- [ ] No test/debug code left in production files
- [ ] All console.logs removed or set to debug level
- [ ] No credentials hardcoded anywhere
- [ ] .gitignore prevents committing .env files
- [ ] Project ready for git commit
- [ ] Deployment documentation is current

---

## Sign-Off

**Date**: _______________

**Deployed By**: _______________

**Environment**: ☐ Development ☐ Staging ☐ Production

**All checkboxes verified**: ☐ YES ☐ NO

**Notes**: 
_________________________________________________________________

_________________________________________________________________

**Issues Found**:
_________________________________________________________________

_________________________________________________________________

---

**If ALL checkboxes are marked ✅ and the system works end-to-end, deployment is COMPLETE and PRODUCTION-READY.**
