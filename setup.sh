#!/bin/bash

echo "🚀 Wazuh LLM Orchestration Setup"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OPENAI_API_KEY"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter after you've added your API key..."
fi

# Check if MCP server is running
echo ""
echo "🔍 Checking MCP server..."
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ MCP server is running at http://localhost:3000"
else
    echo "❌ MCP server is NOT running at http://localhost:3000"
    echo "   Please start your Wazuh MCP server before continuing"
    exit 1
fi

# Check Docker
echo ""
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi
echo "✅ Docker is installed"

# Build and start
echo ""
echo "🏗️  Building Docker containers..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check backend health
echo ""
echo "🏥 Checking backend health..."
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend might not be ready yet. Check logs with: docker-compose logs backend"
fi

# Check frontend
echo ""
echo "🖥️  Checking frontend..."
if curl -s -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend might not be ready yet. Check logs with: docker-compose logs frontend"
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application at: http://localhost:3001"
echo "📡 Backend API at: http://localhost:8000"
echo "📚 API docs at: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Rebuild: docker-compose up --build"
echo ""
