#!/bin/bash

# Chemical Compound Manager - Docker Setup Script

set -e

echo "🐳 Setting up Chemical Compound Manager with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p chemical-compound-backend/data
mkdir -p chemical-compound-backend/logs

# Copy environment file for Docker
echo "⚙️  Setting up environment configuration..."
if [ ! -f chemical-compound-backend/.env ]; then
    if [ -f chemical-compound-backend/.env.docker ]; then
        cp chemical-compound-backend/.env.docker chemical-compound-backend/.env
        echo "✅ Environment file created from Docker template"
    else
        cp .env.docker.template chemical-compound-backend/.env
        echo "✅ Environment file created from template"
        echo "⚠️  Please review and update chemical-compound-backend/.env with your settings"
    fi
else
    echo "ℹ️  Environment file already exists"
fi

# Build and start the containers
echo "🏗️  Building Docker images..."
docker-compose build

echo "🚀 Starting the application..."
docker-compose up -d

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Run database migrations and import data
echo "🗄️  Setting up database..."
docker-compose exec backend npm run setup

echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop app: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Rebuild: docker-compose build --no-cache"