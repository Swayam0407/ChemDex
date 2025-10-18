# Chemical Compound Manager - Setup Guide

## Method 1: Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Setup Steps
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
git clone https://github.com/Swayam0407/ChemDx.git
cd ChemDx

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

## Method 2: Traditional Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup Steps

#### 1. Clone Repository
```bash
git clone https://github.com/Swayam0407/ChemDx.git
cd ChemDex
```

#### 2. Backend Setup
```bash
# Navigate to backend
cd chemical-compound-backend

# Install dependencies
npm install

# Setup environment
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
