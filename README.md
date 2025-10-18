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
│   │   ├── environments/          # Environment configurations
│   │   └── ...
│   ├── package.json
│   └── angular.json
│
├── chemical-compound-backend/      # Express.js backend API
│   ├── src/
│   │   ├── config/               # Database and app configuration
│   │   ├── controllers/          # API route handlers
│   │   ├── models/               # Sequelize models
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   └── server.js             # Main server file
│   ├── package.json
│   └── .env                      # Environment variables
│
└── .kiro/specs/chemical-compound-manager/  # Project specifications
    ├── requirements.md
    ├── design.md
    └── tasks.md
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
- MySQL database
- CORS for cross-origin requests

## Getting Started

### 🐳 Docker Deployment (Recommended)

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
- MySQL server (optional, SQLite is used by default)
- npm or yarn package manager

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

4. Start the development server:
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

## Next Steps

This completes the initial project setup. The next tasks will involve:
1. Setting up the database schema and models
2. Implementing API endpoints
3. Creating Angular components and services
4. Building the user interface

