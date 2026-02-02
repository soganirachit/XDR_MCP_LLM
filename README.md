# Wazuh LLM Orchestration with thesys UI

AI-powered Wazuh SIEM analysis with beautiful, interactive generative UI.

## Features

- 🤖 **AI-Powered Analysis**: GPT-4o processes natural language queries
- 🛡️ **Wazuh Integration**: Direct connection to Wazuh via MCP server
- 🎨 **Generative UI**: Beautiful, interactive visualizations using thesys
- 💬 **Chat Interface**: Conversational security analysis
- 🔒 **Guardrails**: Scope limited to security/Wazuh queries only
- 🚀 **Dockerized**: Easy deployment with Docker Compose

## Prerequisites

- Docker & Docker Compose
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- **Wazuh MCP server running on `http://localhost:3000`**

## Quick Start

### 1. Clone and Setup
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup (will guide you through configuration)
./setup.sh
```

### 2. Configure Environment
Edit `.env` and add your OpenAI API key:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Verify MCP Server
```bash
# MCP server should be running on port 3000
curl http://localhost:3000/health | jq
```

### 4. Start Services
```bash
docker-compose up -d
```

### 5. Access Application
- **Frontend UI**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Usage

### Example Queries

1. **Security Alerts**
   ```
   Show me all critical alerts from the last 24 hours
   ```

2. **Agent Status**
   ```
   Give me an overview of all my Wazuh agents
   ```

3. **Vulnerabilities**
   ```
   Find vulnerabilities with CVSS score above 7.0
   ```

4. **Compliance**
   ```
   Show me PCI-DSS compliance status
   ```

### Follow-up Questions
The system maintains context, so you can ask follow-up questions:
```
User: "Show me all agents"
Assistant: [displays agent list]
User: "Which ones are disconnected?"
Assistant: [filters for disconnected agents]
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build

# Restart specific service
docker-compose restart backend

# Check service health
curl http://localhost:8000/health
```

## Configuration

All configuration via `.env` file:

### Required
- `OPENAI_API_KEY` - Your OpenAI API key
- `MCP_SERVER_URL` - Wazuh MCP server endpoint (default: http://host.docker.internal:3000)

### Optional
- `BACKEND_PORT` - Backend API port (default: 8000)
- `FRONTEND_PORT` - Frontend UI port (default: 3001)
- `OPENAI_MODEL` - OpenAI model (default: gpt-4o)
- `SESSION_MAX_MESSAGES` - Context window size (default: 10)
- `STRICT_GUARDRAILS` - Enable/disable query filtering (default: true)

See `.env.example` for all options.

## Architecture

```
User → Frontend (React + thesys) → Backend (FastAPI) → OpenAI (GPT-4o)
                                                      ↓
                                               MCP Server (Wazuh Data)
```

## Troubleshooting

### MCP Connection Failed
```bash
# Check if MCP server is running
curl http://localhost:3000/health

# Check Docker can access localhost
docker run --rm alpine ping host.docker.internal
```

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Verify OpenAI API key is set
docker-compose exec backend env | grep OPENAI_API_KEY
```

### Frontend Can't Reach Backend
```bash
# Check VITE_API_URL in .env
# Should be: VITE_API_URL=http://localhost:8000

# Rebuild frontend
docker-compose up --build frontend
```

## Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
