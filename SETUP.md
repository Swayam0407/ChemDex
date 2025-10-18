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

## Method 2: Traditional Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

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

# Setup environment
cp .env.example .env

# Run database setup (creates tables and imports CSV data)
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

## Database Information

### Database Used
- **Default**: SQLite (file-based database stored in `chemical-compound-backend/data/database.sqlite`)
- **Alternative**: MySQL (can be configured in `.env` file)

### Loading CSV Data
The application includes chemical compound data in CSV format. The data is automatically imported during setup, but you can also run it manually:

```bash
cd chemical-compound-backend
node scripts/importCsv.js
```

**Available Scripts:**
- `npm run setup` - Runs database migration and CSV import
- `npm run migrate` - Creates database tables only
- `npm run import` - Imports CSV data only (equivalent to `node scripts/importCsv.js`)

The CSV file is located at `chemical-compound-backend/data/nuvcompounds.csv` and contains comprehensive chemical compound information.
