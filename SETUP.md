# Chemical Compound Manager - Setup Guide

Choose your preferred setup method below:

## 🐳 Method 1: Docker Setup (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Swayam0407/ChemDex.git
cd ChemDex

# Run automated setup
./docker-setup.sh
```

### Manual Docker Setup
```bash
# Clone the repository
git clone https://github.com/Swayam0407/ChemDex.git
cd ChemDex

# Build and start containers
docker-compose up -d --build

# Initialize database
docker-compose exec backend npm run setup
```

### Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

### Stop Application
```bash
docker-compose down
```

---

## 💻 Method 2: Traditional Setup (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Steps

#### 1. Clone Repository
```bash
git clone https://github.com/Swayam0407/ChemDex.git
cd ChemDex
```

#### 2. Backend Setup
```bash
# Navigate to backend
cd chemical-compound-backend

# Install dependencies
npm install

# Setup environment (SQLite is used by default)
cp .env.example .env

# Run database setup
npm run setup

# Start backend server
npm run dev
```

#### 3. Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd chemical-compound-frontend

# Install dependencies
npm install

# Start frontend server
ng serve
```

### Access Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

---

## 🔧 Troubleshooting

### Port Conflicts
If you encounter port conflicts:
```bash
# Check what's using ports
lsof -i :80
lsof -i :3000
lsof -i :4200

# For Docker: Change ports in docker-compose.yml
# For Local: Backend uses PORT env var, Frontend uses ng serve --port
```

### Docker Issues
```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Local Development Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset database (if using SQLite)
rm -f data/database.sqlite
npm run setup
```

---

## 📝 Notes

- **Docker method** is recommended for quick evaluation and consistent environment
- **Traditional method** is better for development and customization
- Both methods use SQLite by default (no external database required)
- The application includes sample data and user authentication

**Setup time**: ~2 minutes with Docker, ~5 minutes traditional