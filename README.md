# CTEM WebApp - Cyber Threat and Exposure Management

A comprehensive web application for managing cyber threats and exposures, asset inventory, vulnerability tracking, and security posture monitoring.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Components](#system-components)
- [Setup Instructions](#setup-instructions)
- [API Integration](#api-integration)
- [Database Structure](#database-structure)
- [Development Workflow](#development-workflow)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)

## Architecture Overview

CTEM WebApp follows a modern microservices-inspired architecture with a clear separation between frontend and backend:

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐
│                 │    JSON/API        │                 │
│     Frontend    │<────────────────-->│     Backend     │
│  (React/Vite)   │                    │  (Node.js/Express) │
│                 │                    │                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ Prisma ORM
                                                │
                                       ┌────────▼────────┐
                                       │                 │
                                       │   PostgreSQL    │
                                       │   Database      │
                                       │                 │
                                       └─────────────────┘
```

### Key Features

- **Asset Management**: Inventory and track all network assets
- **Vulnerability Management**: Identify, track, and remediate security vulnerabilities
- **Security Posture Monitoring**: Visual dashboards for security health metrics
- **Scanning Integration**: Run and process security scans against assets
- **Reporting**: Generate detailed security reports

## System Components

### Frontend

- **Technology Stack**: React 19, TypeScript, Material UI v7, Vite
- **Architecture**: Component-based architecture with custom hooks for state management
- **Key Features**: Responsive UI, interactive dashboards, data visualization, form validation

See [frontend/README.md](./frontend/README.md) for detailed frontend documentation.

### Backend

- **Technology Stack**: Node.js, Express, Prisma ORM, PostgreSQL
- **Architecture**: Modular services architecture with clear separation of concerns
- **Key Features**: RESTful API, database abstraction, security scan processing

See [backend/README.md](./backend/README.md) for detailed backend documentation.

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- PostgreSQL (via Docker or local installation)
- WSL (Windows Subsystem for Linux) if running on Windows

### Complete Setup Process

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/ctem-webapp.git
   cd ctem-webapp
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install

   # Create .env file
   echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ctem_webapp_dev
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173" > .env

   # Start the PostgreSQL database
   npm run db:start

   # Initialize the database schema
   npm run db:update
   ```

3. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the full stack (in separate terminals)**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**

   Open your browser and navigate to http://localhost:5173

## API Integration

The frontend and backend communicate via a RESTful API. All API endpoints return JSON responses and follow standard HTTP status codes.

### API Flow

1. **Frontend Request**: The frontend makes HTTP requests to the backend API endpoints using the Fetch API or Axios
2. **Backend Processing**: The backend processes the request, interacts with the database, and performs business logic
3. **Response**: The backend sends a JSON response back to the frontend
4. **State Update**: The frontend updates its state based on the response

### Key API Endpoints

| Endpoint                | Method | Description                 | Request Body         | Response                    |
| ----------------------- | ------ | --------------------------- | -------------------- | --------------------------- |
| `/api/assets`           | GET    | Retrieve all assets         | N/A                  | Array of asset objects      |
| `/api/assets/:id`       | GET    | Get a specific asset        | N/A                  | Single asset object         |
| `/api/assets`           | POST   | Create a new asset          | Asset object         | Created asset with ID       |
| `/api/scan/start`       | POST   | Start a security scan       | Scan options         | Scan results or job ID      |
| `/api/parser/save`      | POST   | Parse and save scan results | Scan ID or file path | Parsed results              |
| `/api/reports/generate` | POST   | Generate a security report  | Report options       | Report data or download URL |

### Error Handling

- Backend returns appropriate HTTP status codes (200, 400, 401, 404, 500, etc.)
- Error responses include detailed error messages and codes
- Frontend handles errors gracefully with user-friendly notifications

## Database Structure

The application uses PostgreSQL with the Prisma ORM. The main entities and their relationships are:

### Core Entities

1. **Asset**: Core entity representing systems and devices
   - Properties: hostname, IP address, OS details, status
   - Relationships: One-to-many with Services and Applications
2. **Service**: Network services and system services running on assets

   - Properties: name, port, protocol, status
   - Relationships: Many-to-one with Asset

3. **Application**: Software installed on assets

   - Properties: name, version, publisher, install date
   - Relationships: Many-to-one with Asset

4. **Vulnerability**: Security vulnerabilities and findings
   - Properties: name, type, CVSS score, severity, status
   - Relationships: Many-to-many with Asset via AssetVulnerability

### Entity Relationships

```
Asset
  ┣━━━━━ Services (One-to-many)
  ┣━━━━━ Applications (One-to-many)
  ┣━━━━━ Vulnerabilities (Many-to-many via AssetVulnerability)
  ┗━━━━━ SecurityMetrics (One-to-one)

Vulnerability
  ┣━━━━━ Assets (Many-to-many via AssetVulnerability)
  ┗━━━━━ Applications (Many-to-many via ApplicationVulnerability)
```

See the [backend/prisma/schema.prisma](./backend/prisma/schema.prisma) file for the complete database schema.

## Development Workflow

### Local Development

1. Start the backend and frontend in development mode

   ```bash
   # Terminal 1
   cd backend
   npm run dev

   # Terminal 2
   cd frontend
   npm run dev
   ```

2. Changes to the frontend will automatically reload thanks to Vite's hot module replacement
3. Changes to the backend will automatically reload thanks to nodemon

### Making Database Changes

1. Edit the Prisma schema file: `backend/prisma/schema.prisma`
2. Apply the changes to the database:
   ```bash
   cd backend
   npm run db:update
   ```

### Adding New API Endpoints

1. Create or modify route files in `backend/src/routes/`
2. Implement service logic in `backend/src/services/`
3. Update API documentation in this README

### Creating New Frontend Components

1. Create component files in appropriate directories under `frontend/src/components/`
2. Create or update custom hooks in `frontend/src/hooks/` if needed
3. Update the frontend README documentation if needed

## Folder Structure

The repository is organized into two main directories:

```
ctem-webapp/
├── backend/            # Backend Node.js application
│   ├── prisma/         # Prisma ORM schema and migrations
│   ├── src/            # Source code
│   │   ├── core/       # Core application components
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic services
│   │   ├── utils/      # Utilities
│   │   └── scripts/    # Database and other scripts
│   ├── docker-compose.yml  # Docker configuration
│   └── package.json    # Dependencies and scripts
│
├── frontend/           # Frontend React application
│   ├── public/         # Static assets
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── pages/      # Top-level page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utilities
│   ├── index.html      # HTML entry point
│   └── package.json    # Dependencies and scripts
│
└── README.md           # This file
```

For more detailed structure information, see the README files in the respective directories.

## Deployment

### Production Build

1. Build the frontend

   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend (if using TypeScript)
   ```bash
   cd backend
   npm run build
   ```
