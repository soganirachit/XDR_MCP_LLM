.PHONY: help setup start stop restart logs clean build

help:
	@echo "Wazuh LLM Orchestration - Available Commands"
	@echo "============================================="
	@echo "make setup    - Initial setup (create .env, build containers)"
	@echo "make start    - Start all services"
	@echo "make stop     - Stop all services"
	@echo "make restart  - Restart all services"
	@echo "make logs     - Show logs (follow mode)"
	@echo "make build    - Rebuild containers"
	@echo "make clean    - Stop and remove containers, networks, volumes"
	@echo "make test     - Run tests"

setup:
	@chmod +x setup.sh
	@./setup.sh

start:
	@docker-compose up -d
	@echo "✅ Services started"
	@echo "🌐 Frontend: http://localhost:3001"
	@echo "📡 Backend: http://localhost:8000"

stop:
	@docker-compose down
	@echo "✅ Services stopped"

restart:
	@docker-compose restart
	@echo "✅ Services restarted"

logs:
	@docker-compose logs -f

build:
	@docker-compose build
	@echo "✅ Containers rebuilt"

clean:
	@docker-compose down -v
	@echo "✅ Cleaned up containers, networks, and volumes"

test:
	@echo "Running tests..."
	@docker-compose exec backend pytest
