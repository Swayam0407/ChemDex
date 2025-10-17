# Chemical Compound Manager

A full-stack web application for managing and displaying chemical compound information.

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

### Prerequisites
- Node.js (v18 or higher)
- MySQL server
- npm or yarn package manager

### Backend Setup
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

### Frontend Setup
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

Refer to the task list in `.kiro/specs/chemical-compound-manager/tasks.md` for detailed implementation steps.