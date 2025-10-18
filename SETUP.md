# Chemical Compound Manager - Quick Setup

## Prerequisites
- Docker
- Docker Compose

## Setup Instructions

### Option 1: Automated Setup (Recommended)
```bash
./docker-setup.sh
```

### Option 2: Manual Setup
```bash
docker-compose up -d --build
docker-compose exec backend npm run setup
```

## Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

## Stop Application
```bash
docker-compose down
```

## Troubleshooting
If you encounter port conflicts, check what's using ports 80 and 3000:
```bash
# Check ports
lsof -i :80
lsof -i :3000

# Or change ports in docker-compose.yml
```

That's it! The application should be running in under 2 minutes.