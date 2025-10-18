# Chemical Compound Manager - Docker Management

.PHONY: help build up down logs restart clean setup dev prod

# Default target
help:
	@echo "Chemical Compound Manager - Docker Commands"
	@echo ""
	@echo "Production Commands:"
	@echo "  make setup    - Initial setup and start (recommended)"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start containers"
	@echo "  make down     - Stop containers"
	@echo "  make restart  - Restart containers"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev      - Start development environment"
	@echo "  make dev-down - Stop development environment"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make logs     - View logs"
	@echo "  make clean    - Clean up containers and images"
	@echo "  make reset    - Reset database"
	@echo ""

# Production commands
setup:
	@echo "🚀 Setting up Chemical Compound Manager..."
	@mkdir -p chemical-compound-backend/data chemical-compound-backend/logs
	@docker-compose up -d --build
	@echo "⏳ Waiting for services to start..."
	@sleep 15
	@docker-compose exec backend npm run setup
	@echo "✅ Setup complete!"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"

build:
	@echo "🏗️ Building Docker images..."
	@docker-compose build

up:
	@echo "🚀 Starting containers..."
	@docker-compose up -d

down:
	@echo "🛑 Stopping containers..."
	@docker-compose down

restart:
	@echo "🔄 Restarting containers..."
	@docker-compose restart

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	@mkdir -p chemical-compound-backend/data chemical-compound-backend/logs
	@docker-compose -f docker-compose.dev.yml up -d --build
	@echo "✅ Development environment started!"
	@echo "Frontend: http://localhost:4200"
	@echo "Backend: http://localhost:3000"

dev-down:
	@echo "🛑 Stopping development environment..."
	@docker-compose -f docker-compose.dev.yml down

# Utility commands
logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

clean:
	@echo "🧹 Cleaning up Docker resources..."
	@docker-compose down -v
	@docker system prune -f
	@docker volume prune -f

reset:
	@echo "🗄️ Resetting database..."
	@docker-compose down
	@rm -rf chemical-compound-backend/data/database.sqlite
	@docker-compose up -d
	@sleep 10
	@docker-compose exec backend npm run setup
	@echo "✅ Database reset complete!"

# Database operations
migrate:
	@docker-compose exec backend npm run migrate

import:
	@docker-compose exec backend npm run import

create-admin:
	@docker-compose exec backend npm run create-admin

# Container access
shell-backend:
	@docker-compose exec backend sh

shell-frontend:
	@docker-compose exec frontend sh

# Health checks
health:
	@echo "🏥 Checking application health..."
	@curl -f http://localhost:3000/health || echo "Backend not responding"
	@curl -f http://localhost/ || echo "Frontend not responding"