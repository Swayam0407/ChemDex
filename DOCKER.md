# Docker Deployment Guide

This guide explains how to run the Chemical Compound Manager application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically configure and start the application:

```bash
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```

2. **Initialize the database:**
   ```bash
   docker-compose exec backend npm run setup
   ```

## Application URLs

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000

## Docker Services

### Backend Service
- **Container:** `chemical-compound-backend`
- **Port:** 3000
- **Database:** SQLite (persistent volume)
- **Environment:** Production-optimized Node.js

### Frontend Service
- **Container:** `chemical-compound-frontend`
- **Port:** 80
- **Server:** Nginx with optimized configuration
- **Build:** Multi-stage build for minimal image size

## Useful Commands

### Container Management
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop the application
docker-compose down

# Restart services
docker-compose restart

# Rebuild images
docker-compose build --no-cache
```

### Database Operations
```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Import CSV data
docker-compose exec backend npm run import

# Create admin user
docker-compose exec backend npm run create-admin

# Access backend container shell
docker-compose exec backend sh
```

### Development
```bash
# Start with live logs
docker-compose up

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

## Data Persistence

- **Database:** SQLite database is stored in `./chemical-compound-backend/data/`
- **Logs:** Application logs are stored in `./chemical-compound-backend/logs/`
- **Volumes:** Data persists between container restarts

## Environment Configuration

The application uses environment variables defined in:
- `chemical-compound-backend/.env.docker` (Docker-specific settings)
- `docker-compose.yml` (Container environment)

Key environment variables:
- `NODE_ENV=production`
- `USE_SQLITE=true`
- `PORT=3000`
- `FRONTEND_URL=http://localhost`

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using port 80 or 3000
   lsof -i :80
   lsof -i :3000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database issues:**
   ```bash
   # Reset database
   docker-compose down
   rm -rf chemical-compound-backend/data/database.sqlite
   docker-compose up -d
   docker-compose exec backend npm run setup
   ```

3. **Build issues:**
   ```bash
   # Clean rebuild
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Health Checks

The backend includes health checks. Check container health:
```bash
docker-compose ps
```

### Performance Optimization

- Frontend uses Nginx with gzip compression
- Backend runs in production mode
- Multi-stage builds minimize image sizes
- Static assets are cached for 1 year

## Production Deployment

For production deployment:

1. **Update environment variables:**
   - Change `JWT_SECRET` to a secure random string
   - Update `FRONTEND_URL` to your domain
   - Configure proper database credentials if using MySQL

2. **Use a reverse proxy:**
   - Configure Nginx or Apache as a reverse proxy
   - Set up SSL certificates
   - Configure proper domain routing

3. **Security considerations:**
   - Use Docker secrets for sensitive data
   - Run containers as non-root users
   - Implement proper firewall rules
   - Regular security updates

## Monitoring

Add monitoring services to your docker-compose.yml:
```yaml
# Example monitoring setup (optional)
services:
  # ... existing services ...
  
  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    # Add prometheus configuration
```