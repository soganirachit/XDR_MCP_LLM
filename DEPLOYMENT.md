# Deployment Guide

## Local Development Deployment

### Prerequisites
- Docker Desktop (Mac/Windows) or Docker + Docker Compose (Linux)
- OpenAI API Key
- Wazuh MCP server running locally

### Step 1: Initial Setup
```bash
# Clone or navigate to project directory
cd wazuh-llm-ui

# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

The setup script will:
1. Create `.env` file from template
2. Verify MCP server is running
3. Check Docker installation
4. Build Docker images
5. Start services
6. Verify all services are healthy

### Step 2: Manual Configuration (if needed)
```bash
# Edit .env with your API key
nano .env

# Set these required values:
# OPENAI_API_KEY=sk-proj-xxxxx
# MCP_SERVER_URL=http://localhost:3000 (or your MCP server URL)
```

### Step 3: Start Services
```bash
# Start with Docker Compose
docker-compose up -d

# Or use Make
make start

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment
```bash
# Check backend health
curl http://localhost:8000/health | jq

# Check API docs
open http://localhost:8000/docs

# Access frontend
open http://localhost:3001
```

## Production Deployment

### Environment Preparation

1. **Server Requirements**
   - Docker & Docker Compose
   - Python 3.11+ (for backend)
   - Node.js 20+ (for frontend build)
   - 2GB+ RAM, 1GB+ storage

2. **Network Requirements**
   - Ports 8000 (backend) and 3001 (frontend) open
   - Outbound access to OpenAI API
   - Access to Wazuh MCP server

3. **Security Setup**
   ```bash
   # Generate strong API key recommendations
   # Create .env with production values
   
   # Example production .env
   OPENAI_API_KEY=sk-proj-your-production-key
   MCP_SERVER_URL=https://mcp.yourcompany.com
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=8000
   ENVIRONMENT=production
   DEBUG=false
   LOG_LEVEL=INFO
   STRICT_GUARDRAILS=true
   CORS_ORIGINS=https://yourcompany.com,https://app.yourcompany.com
   ```

### Docker Deployment

```bash
# Build images with production settings
docker-compose -f docker-compose.yml build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Kubernetes Deployment (Optional)

Create `k8s-deployment.yaml`:
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wazuh-llm-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wazuh-llm-backend
  template:
    metadata:
      labels:
        app: wazuh-llm-backend
    spec:
      containers:
      - name: backend
        image: wazuh-llm-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: api-key
        - name: MCP_SERVER_URL
          value: "http://mcp-service:3000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: wazuh-llm-backend
spec:
  selector:
    app: wazuh-llm-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: LoadBalancer
```

Deploy:
```bash
kubectl create secret generic openai-secret \
  --from-literal=api-key=sk-proj-xxxxx

kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods
kubectl logs deployment/wazuh-llm-backend
```

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend availability
curl http://localhost:3001

# MCP connection status
curl http://localhost:8000/health | jq .mcp_connected
```

### Log Management
```bash
# View latest logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > deployment.log

# View specific service
docker-compose logs backend
```

### Performance Tuning

Adjust in `.env`:
```bash
# Increase context window for longer conversations
SESSION_MAX_MESSAGES=20

# Increase OpenAI token limit for complex queries
OPENAI_MAX_TOKENS=8192

# Increase tool iterations for complex queries
MAX_TOOL_ITERATIONS=10

# Adjust concurrent requests
MAX_CONCURRENT_REQUESTS=20
```

### Backup & Recovery

```bash
# Backup .env
cp .env .env.backup

# Restart services gracefully
docker-compose restart

# Full reset (WARNING: deletes volumes)
docker-compose down -v
docker-compose up -d
```

## Scaling Considerations

- **Frontend**: Stateless, can scale horizontally
- **Backend**: Stateless sessions (in-memory, not persistent)
- **Database**: N/A (in-memory session storage)
- **Load Balancer**: Recommended for multi-instance backend

For multi-instance backend:
```yaml
services:
  backend-1:
    # ... backend config
  backend-2:
    # ... backend config
  backend-3:
    # ... backend config
  nginx:
    image: nginx:latest
    ports:
      - "8000:8000"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

## Troubleshooting Deployment

### Service won't start
```bash
# Check Docker logs
docker-compose logs backend

# Verify .env variables are set
docker-compose config | grep OPENAI_API_KEY

# Check port availability
lsof -i :8000
lsof -i :3001
```

### MCP connection fails
```bash
# Verify MCP server is reachable
curl http://localhost:3000/health

# Check network connectivity
docker run --rm --network host curlimages/curl http://localhost:3000/health

# Update MCP_SERVER_URL in .env if on different host
```

### High memory usage
```bash
# Reduce session context size
SESSION_MAX_MESSAGES=5

# Reduce OpenAI token limit
OPENAI_MAX_TOKENS=2048

# Restart services
docker-compose restart
```

## Success Criteria

✅ Backend health check returns `status: healthy`
✅ Frontend available at http://localhost:3001
✅ Chat interface loads without errors
✅ API documentation accessible at http://localhost:8000/docs
✅ Sample query returns valid response
✅ thesys components render correctly
✅ Guardrails block non-security queries
✅ Context maintained across messages
