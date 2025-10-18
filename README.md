# Chemical Compound Manager

A full-stack web application for managing and displaying chemical compound information.

## Screenshots
<img width="1680" height="929" alt="Screenshot 2025-10-18 at 1 18 43 AM" src="https://github.com/user-attachments/assets/d0e68c01-4d46-43d3-a2c3-de758552ad68" />

<img width="1680" height="931" alt="Screenshot 2025-10-18 at 1 19 00 AM" src="https://github.com/user-attachments/assets/4944002d-bffd-4358-9924-51ddd30ab60d" />

<img width="1680" height="930" alt="Screenshot 2025-10-18 at 1 20 33 AM" src="https://github.com/user-attachments/assets/1286640d-8e40-42ba-960b-9e27f8d11260" />

<img width="1680" height="930" alt="Screenshot 2025-10-18 at 1 20 47 AM" src="https://github.com/user-attachments/assets/dbe49dd4-58b6-4d4e-bb2b-1de53239e96c" />

## Project Structure

```
├── chemical-compound-frontend/     # Angular frontend application
│   ├── src/
│   │   ├── app/                   # Angular components and services
│   │   │   ├── components/        # UI components
│   │   │   ├── services/          # Angular services
│   │   │   ├── interceptors/      # HTTP interceptors
│   │   │   └── periodic-table/    # Periodic table feature
│   │   ├── environments/          # Environment configurations
│   │   └── styles.scss            # Global styles
│   ├── package.json
│   └── angular.json
│
├── chemical-compound-backend/      # Express.js backend API
│   ├── src/
│   │   ├── config/               # Database and app configuration
│   │   ├── controllers/          # API route handlers
│   │   ├── repositories/         # Data access layer
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── utils/                # Utility functions
│   │   └── server.js             # Main server file
│   ├── data/                     # Database and CSV files
│   ├── scripts/                  # Database migration scripts
│   ├── package.json
│   ├── .env                      # Environment variables
│   └── .env.example              # Environment template
│
├── docker-compose.yml              # Production Docker setup
├── docker-compose.dev.yml          # Development Docker setup
├── Dockerfile.backend              # Backend container configuration
├── Dockerfile.frontend             # Frontend container configuration
├── nginx.conf                      # Nginx configuration for frontend
├── docker-setup.sh                 # Automated Docker setup script
├── Makefile                        # Docker management commands
├── DOCKER.md                       # Docker documentation
├── SETUP.md                        # Quick setup guide
└── README.md                       # Project documentation
```

## Technology Stack

### Frontend
- Angular 18+ with TypeScript
- Angular Material for UI components
- SCSS for styling
- Angular Router for navigation

### Backend
- Node.js with Express.js
- Sequelize ORM for database operations
- SQLite database (default) with MySQL support
- CORS for cross-origin requests

## Getting Started

### 🐳 Docker Deployment 

The easiest way to run the application is using Docker:

```bash
# Quick setup with Docker
./docker-setup.sh
```

Or manually:
```bash
docker-compose up -d --build
docker-compose exec backend npm run setup
```

**Application URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:3000

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

### 💻 Local Development Setup

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MySQL server (optional, SQLite is used by default)

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd chemical-compound-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run database migrations and import CSV data:
   ```bash
   npm run setup
   # Or run individually:
   # npm run migrate  # Create database tables
   # npm run import   # Import CSV data (node scripts/importCsv.js)
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd chemical-compound-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

## Development

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:4200
- API endpoints: http://localhost:3000/api

## Database Information

### Database Configuration
- **Default**: SQLite (stored in `chemical-compound-backend/data/database.sqlite`)
- **Alternative**: MySQL (configure in `.env` file by setting `USE_SQLITE=false`)

### Data Import
The application includes a CSV file with chemical compound data. To load this data:

```bash
cd chemical-compound-backend
node scripts/importCsv.js
```

Or use the setup command which runs both migration and import:
```bash
npm run setup
```

The CSV data is located at `chemical-compound-backend/data/nuvcompounds.csv` and contains chemical compound information including names, formulas, molecular weights, and other properties.


