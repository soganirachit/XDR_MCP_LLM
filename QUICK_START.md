# QUICK START GUIDE

## ⚡ Get Running in 5 Minutes

### Step 1: Prepare Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it (you'll need it in the next step)

### Step 2: Configure Environment
```bash
cd /Users/rachitsogani/Documents/socAi/wazuh_orchestration/wazuh-llm-ui

# Copy template
cp .env.example .env

# Edit with your API key
nano .env
# Find: OPENAI_API_KEY=sk-proj-your-key-here
# Replace with your actual key: OPENAI_API_KEY=sk-proj-xxxxx
```

### Step 3: Verify Prerequisites
```bash
# Check Docker
docker --version
docker-compose --version

# Check MCP server (should be running on port 3000)
curl http://localhost:3000/health
```

### Step 4: Start the System
```bash
# Automated setup (recommended)
chmod +x setup.sh
./setup.sh

# OR manual start
docker-compose up -d
```

### Step 5: Access Application
- **Frontend UI**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 🧪 Test It

### In Your Browser
1. Open http://localhost:3001
2. Type: "Show me critical alerts"
3. Wait for response (~5-15 seconds)
4. See beautiful visualizations!

### In Terminal
```bash
# Send a test message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "message": "Show me wazuh agents"
  }' | jq
```

---

## 📋 Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Using Make (if you prefer)
make start    # Start services
make logs     # View logs
make stop     # Stop services
make restart  # Restart services
```

---

## ❌ Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
# Look for error messages, usually about .env or API key
```

### MCP Connection Failed
```bash
# Check if MCP is running
curl http://localhost:3000/health

# If not running:
# Start your Wazuh MCP server on port 3000
```

### Can't access frontend
```bash
# Check if port 3001 is available
lsof -i :3001

# Check logs
docker-compose logs frontend
```

### Frontend can't reach backend
```bash
# Verify API URL in .env
cat .env | grep VITE_API_URL

# Should be: VITE_API_URL=http://localhost:8000

# Rebuild if needed
docker-compose up --build frontend
```

---

## 📚 Full Documentation

- **README.md** - Features and basic usage
- **ARCHITECTURE.md** - System design details
- **DEPLOYMENT.md** - Production deployment guide
- **PROJECT_SUMMARY.md** - Complete project overview
- **VALIDATION_CHECKLIST.md** - Pre-deployment verification
- **FILES_MANIFEST.md** - All files created

---

## ✅ Success Indicators

Backend is healthy:
```bash
$ curl http://localhost:8000/health | jq
{
  "status": "healthy",
  "mcp_connected": true,
  "timestamp": "2026-02-01T23:30:00"
}
```

Frontend loads:
```bash
$ curl http://localhost:3001 | head -10
<!doctype html>
<html lang="en">
...
```

Chat works:
```bash
$ curl -X POST http://localhost:8000/chat ... | jq
{
  "session_id": "...",
  "message": "Here are your...",
  "components": [...],
  "tool_calls_made": 2
}
```

---

## 🎯 Example Queries to Try

```
"Show me all critical alerts"
"What's the status of my agents?"
"Find vulnerabilities with high CVSS"
"List compliance violations"
"Show me failed authentications"
"Which agents are disconnected?"
"Give me a summary of today's security events"
```

---

## 🚀 Ready?

```bash
cd /Users/rachitsogani/Documents/socAi/wazuh_orchestration/wazuh-llm-ui
./setup.sh
```

**Your secure AI-powered Wazuh assistant is launching!** 🛡️

---

**Need help?** Check the docs or review the logs:
```bash
docker-compose logs -f
```
